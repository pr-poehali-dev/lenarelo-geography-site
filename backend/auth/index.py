"""
Business: Авторизация и регистрация пользователей с Simple Query Protocol
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
        except:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid JSON'}),
                'isBase64Encoded': False
            }
        
        action = body.get('action')
        
        if action == 'login':
            username = body.get('username')
            password = body.get('password')
            
            conn = psycopg2.connect(database_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            username_escaped = username.replace("'", "''")
            cur.execute(
                f"SELECT id, username, password_hash, email, full_name, is_admin FROM users WHERE username = '{username_escaped}'"
            )
            user = cur.fetchone()
            
            cur.close()
            conn.close()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
            
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'is_admin': user['is_admin']
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
        
        elif action == 'register':
            username = body.get('username')
            password = body.get('password')
            email = body.get('email')
            full_name = body.get('full_name')
            invite_code = body.get('invite_code', '').upper()
            
            valid_codes = ['LENARELO', 'GEO2024', 'OGE2025']
            if invite_code not in valid_codes:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный код приглашения. Попросите код у преподавателя.'}),
                    'isBase64Encoded': False
                }
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            conn = psycopg2.connect(database_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            try:
                username_escaped = username.replace("'", "''")
                password_hash_escaped = password_hash.replace("'", "''")
                email_escaped = email.replace("'", "''")
                full_name_escaped = full_name.replace("'", "''")
                cur.execute(
                    f"INSERT INTO users (username, password_hash, email, full_name, is_admin) VALUES ('{username_escaped}', '{password_hash_escaped}', '{email_escaped}', '{full_name_escaped}', FALSE) RETURNING id, username, email, full_name, is_admin"
                )
                user = cur.fetchone()
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'is_admin': user['is_admin']
                    }),
                    'isBase64Encoded': False
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким логином или email уже существует'}),
                    'isBase64Encoded': False
                }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }