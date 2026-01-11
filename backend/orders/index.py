import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Получить соединение с БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Управление заказами магазина"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            auth_header = event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            
            if token:
                cur.execute(
                    """
                    SELECT u.id as user_id, u.is_admin
                    FROM users u
                    JOIN sessions s ON u.id = s.user_id
                    WHERE s.token = %s AND s.expires_at > NOW()
                    """,
                    (token,)
                )
                user = cur.fetchone()
                
                if user:
                    if user['is_admin']:
                        cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
                    else:
                        cur.execute("SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user['user_id'],))
                    
                    orders = cur.fetchall()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps([dict(o) for o in orders], default=str),
                        'isBase64Encoded': False
                    }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            auth_header = event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            user_id = None
            
            if token:
                cur.execute(
                    "SELECT user_id FROM sessions WHERE token = %s AND expires_at > NOW()",
                    (token,)
                )
                session = cur.fetchone()
                if session:
                    user_id = session['user_id']
            
            cur.execute(
                """
                INSERT INTO orders (user_id, customer_name, phone, email, address, comment, delivery_type, items, total, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    user_id,
                    body.get('customerName'),
                    body.get('phone'),
                    body.get('customerEmail'),
                    body.get('address'),
                    body.get('comment'),
                    body.get('deliveryType'),
                    json.dumps(body.get('items', [])),
                    body.get('total'),
                    'new'
                )
            )
            new_order = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_order), default=str),
                'isBase64Encoded': False
            }
        
        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            order_id = body.get('id')
            
            cur.execute(
                """
                UPDATE orders 
                SET status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (body.get('status'), order_id)
            )
            updated_order = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_order) if updated_order else {'success': True}, default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()