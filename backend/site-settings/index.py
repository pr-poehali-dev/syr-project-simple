import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Получить соединение с БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Управление настройками сайта (логотип, дизайн, фото фермы)"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cur.execute("SELECT key, value FROM site_settings")
            rows = cur.fetchall()
            
            settings = {}
            for row in rows:
                settings[row['key']] = json.loads(row['value'])
            
            if not settings:
                settings = {
                    'logo': '🧀',
                    'theme': 'default',
                    'minDeliveryAmount': 2500,
                    'siteDescription': 'Сыроварня SOBKO — натуральные продукты с любовью и заботой о вашем здоровье!',
                    'telegramBotToken': '8530330128:AAH7zYq7jWo-TdGIZStP3AMDL5s_-Jzbkcg',
                    'telegramChatId': '6368037525, 295345720',
                    'farmPhotos': []
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(settings),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            for key, value in body.items():
                cur.execute(
                    """
                    INSERT INTO site_settings (key, value, updated_at) 
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE 
                    SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
                    """,
                    (key, json.dumps(value))
                )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Настройки сохранены'}),
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