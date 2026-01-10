import json
import os

PRODUCTS_FILE = '/tmp/products.json'

def handler(event: dict, context) -> dict:
    """Управление товарами магазина"""
    
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
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                products = json.load(f)
        else:
            products = []
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(products),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                products = json.load(f)
        else:
            products = []
        
        max_id = max([p.get('id', 0) for p in products], default=0)
        new_product = body
        new_product['id'] = max_id + 1
        products.append(new_product)
        
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(new_product),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        product_id = body.get('id')
        
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                products = json.load(f)
        else:
            products = []
        
        products = [body if p['id'] == product_id else p for p in products]
        
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
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
        product_id = int(query_params.get('id', 0))
        
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                products = json.load(f)
        else:
            products = []
        
        products = [p for p in products if p['id'] != product_id]
        
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
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
