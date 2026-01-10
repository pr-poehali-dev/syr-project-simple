import json
import os
from datetime import datetime

ORDERS_FILE = '/tmp/orders.json'

def handler(event: dict, context) -> dict:
    """Управление заказами магазина"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        if os.path.exists(ORDERS_FILE):
            with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(orders),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        
        if os.path.exists(ORDERS_FILE):
            with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []
        
        max_id = max([o.get('id', 0) for o in orders], default=0)
        new_order = body
        new_order['id'] = max_id + 1
        new_order['date'] = datetime.now().isoformat()
        orders.append(new_order)
        
        with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(orders, f, ensure_ascii=False, indent=2)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(new_order),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        order_id = body.get('id')
        
        if os.path.exists(ORDERS_FILE):
            with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []
        
        orders = [body if o['id'] == order_id else o for o in orders]
        
        with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(orders, f, ensure_ascii=False, indent=2)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        query_params = event.get('queryStringParameters', {}) or {}
        order_id = int(query_params.get('id', 0))
        
        if os.path.exists(ORDERS_FILE):
            with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                orders = json.load(f)
        else:
            orders = []
        
        orders = [o for o in orders if o['id'] != order_id]
        
        with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(orders, f, ensure_ascii=False, indent=2)
        
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
