import json
import random
from datetime import datetime, timedelta

CODES_STORAGE = {}

def handler(event: dict, context) -> dict:
    """Генерация и проверка кодов подтверждения email"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'generate':
            email = body.get('email')
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email is required'}),
                    'isBase64Encoded': False
                }
            
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            CODES_STORAGE[email] = {
                'code': code,
                'expires': (datetime.now() + timedelta(minutes=10)).isoformat()
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'code': code,
                    'message': f'Код подтверждения: {code}. В реальной системе он будет отправлен на email {email}'
                }),
                'isBase64Encoded': False
            }
        
        if action == 'verify':
            email = body.get('email')
            code = body.get('code')
            
            if not email or not code:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email and code are required'}),
                    'isBase64Encoded': False
                }
            
            stored = CODES_STORAGE.get(email)
            if not stored:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'error': 'Код не найден или истёк'}),
                    'isBase64Encoded': False
                }
            
            if stored['code'] != code:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'error': 'Неверный код'}),
                    'isBase64Encoded': False
                }
            
            expires = datetime.fromisoformat(stored['expires'])
            if datetime.now() > expires:
                del CODES_STORAGE[email]
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'error': 'Код истёк'}),
                    'isBase64Encoded': False
                }
            
            del CODES_STORAGE[email]
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Email подтверждён'}),
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
