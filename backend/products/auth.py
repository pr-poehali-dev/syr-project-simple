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
    path = event.get('path', '')
    
    if 'register' in path:
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
    
    elif 'login' in path:
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
    
    elif 'verify' in path:
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
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Endpoint не найден'}),
        'isBase64Encoded': False
    }
