import json
import secrets
import hashlib
from datetime import datetime, timedelta
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    """Хешировать пароль"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Сгенерировать токен сессии"""
    return secrets.token_urlsafe(32)

def handle_auth(event: dict, conn, cur: RealDictCursor) -> dict:
    """Обработка запросов аутентификации"""
    
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', '')
    
    if action == 'register':
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').strip()
        phone = body.get('phone', '').strip()
        password = body.get('password', '')
        full_name = body.get('name', '').strip()
        
        if not email or not password or not full_name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email, имя и пароль обязательны'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (email, phone, password_hash, full_name) VALUES (%s, %s, %s, %s) RETURNING id, email, full_name, phone, is_admin",
            (email, phone, password_hash, full_name)
        )
        user = cur.fetchone()
        conn.commit()
        
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], token, expires_at)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': dict(user),
                'token': token
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'login':
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        login = body.get('login', '').strip()
        password = body.get('password', '')
        
        if not login or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email и пароль обязательны'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        cur.execute(
            "SELECT id, email, full_name, phone, is_admin FROM users WHERE email = %s AND password_hash = %s",
            (login, password_hash)
        )
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный email или пароль'}),
                'isBase64Encoded': False
            }
        
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], token, expires_at)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': dict(user),
                'token': token
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'verify':
        if method != 'GET':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header else ''
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Токен не предоставлен'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """
            SELECT u.id, u.email, u.full_name, u.phone, u.is_admin 
            FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()
            """,
            (token,)
        )
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недействительный или истекший токен'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': dict(user)}),
            'isBase64Encoded': False
        }
    
    elif action == 'profile':
        if method != 'PUT':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header else ''
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT user_id FROM sessions WHERE token = %s AND expires_at > NOW()", (token,))
        session = cur.fetchone()
        
        if not session:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недействительная сессия'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        full_name = body.get('name', '').strip()
        phone = body.get('phone', '').strip()
        email = body.get('email', '').strip()
        new_password = body.get('password', '')
        
        updates = []
        params = []
        
        if full_name:
            updates.append("full_name = %s")
            params.append(full_name)
        if phone:
            updates.append("phone = %s")
            params.append(phone)
        if email:
            updates.append("email = %s")
            params.append(email)
        if new_password:
            updates.append("password_hash = %s")
            params.append(hash_password(new_password))
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(session['user_id'])
            
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, email, full_name, phone, is_admin"
            cur.execute(query, params)
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': dict(user)}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Нет данных для обновления'}),
            'isBase64Encoded': False
        }
    
    elif action == 'users':
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header else ''
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            cur.execute(
                """
                SELECT u.is_admin 
                FROM users u
                JOIN sessions s ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW()
                """,
                (token,)
            )
            user = cur.fetchone()
            
            if not user or not user['is_admin']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Доступ запрещен'}),
                    'isBase64Encoded': False
                }
            
            search = query_params.get('search', '')
            
            if search:
                cur.execute(
                    "SELECT id, email, full_name, phone, is_admin, created_at FROM users WHERE full_name ILIKE %s ORDER BY created_at DESC",
                    (f'%{search}%',)
                )
            else:
                cur.execute("SELECT id, email, full_name, phone, is_admin, created_at FROM users ORDER BY created_at DESC")
            
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(u) for u in users], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            cur.execute(
                """
                SELECT u.is_admin 
                FROM users u
                JOIN sessions s ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW()
                """,
                (token,)
            )
            admin = cur.fetchone()
            
            if not admin or not admin['is_admin']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Доступ запрещен'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('id')
            full_name = body.get('name', '').strip()
            phone = body.get('phone', '').strip()
            email = body.get('email', '').strip()
            new_password = body.get('password', '')
            
            updates = []
            params = []
            
            if full_name:
                updates.append("full_name = %s")
                params.append(full_name)
            if phone:
                updates.append("phone = %s")
                params.append(phone)
            if email:
                updates.append("email = %s")
                params.append(email)
            if new_password:
                updates.append("password_hash = %s")
                params.append(hash_password(new_password))
            
            if updates and user_id:
                updates.append("updated_at = CURRENT_TIMESTAMP")
                params.append(user_id)
                
                query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, email, full_name, phone, is_admin"
                cur.execute(query, params)
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'user': dict(user)}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Некорректные данные'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Endpoint не найден'}),
        'isBase64Encoded': False
    }