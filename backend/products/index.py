import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from auth import handle_auth

def get_db_connection():
    """Получить соединение с БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Управление товарами, регистрация и авторизация"""
    
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
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
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        
        if action in ['auth', 'login', 'register', 'verify', 'profile', 'users']:
            return handle_auth(event, conn, cur)
        
        if method == 'GET':
            cur.execute("SELECT * FROM products ORDER BY id DESC")
            products = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(p) for p in products], default=str),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute(
                """
                INSERT INTO products (name, description, price, weight, category_id, image_url, in_stock, variants)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    body.get('name'),
                    body.get('description'),
                    body.get('price'),
                    body.get('weight'),
                    body.get('category_id'),
                    body.get('image'),
                    body.get('inStock', True),
                    json.dumps(body.get('variants', []))
                )
            )
            new_product = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_product), default=str),
                'isBase64Encoded': False
            }
        
        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('id')
            
            cur.execute(
                """
                UPDATE products 
                SET name = %s, description = %s, price = %s, weight = %s, 
                    category_id = %s, image_url = %s, in_stock = %s, variants = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (
                    body.get('name'),
                    body.get('description'),
                    body.get('price'),
                    body.get('weight'),
                    body.get('category_id'),
                    body.get('image'),
                    body.get('inStock', True),
                    json.dumps(body.get('variants', [])),
                    product_id
                )
            )
            updated_product = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_product) if updated_product else {'success': True}, default=str),
                'isBase64Encoded': False
            }
        
        if method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            product_id = int(query_params.get('id', 0))
            
            cur.execute("UPDATE products SET in_stock = FALSE WHERE id = %s", (product_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
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