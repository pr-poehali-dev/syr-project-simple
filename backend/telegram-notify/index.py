import json
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Отправка уведомлений о новых заказах в Telegram"""
    
    if event.get('httpMethod') == 'OPTIONS':
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
    
    try:
        body = json.loads(event.get('body', '{}'))
        bot_token = body.get('botToken')
        chat_id = body.get('chatId')
        order_data = body.get('orderData', {})
        
        if not bot_token or not chat_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing bot token or chat ID'}),
                'isBase64Encoded': False
            }
        
        message = f"🧀 *Новый заказ!*\n\n"
        message += f"👤 *Клиент:* {order_data.get('fullName', 'Не указано')}\n"
        message += f"📞 *Телефон:* {order_data.get('phone', 'Не указано')}\n"
        message += f"📍 *Адрес:* {order_data.get('address', 'Самовывоз')}\n"
        
        if order_data.get('comment'):
            message += f"💬 *Комментарий:* {order_data['comment']}\n"
        
        message += f"\n📦 *Состав заказа:*\n"
        for item in order_data.get('items', []):
            message += f"• {item['name']} × {item['quantity']} = {item['total']} ₽\n"
        
        message += f"\n💰 *Итого:* {order_data.get('total', 0)} ₽"
        
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }).encode()
        
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'result': result}),
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
