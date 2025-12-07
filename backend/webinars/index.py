"""
Business: Управление вебинарами (создание, получение, список, загрузка видео)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
"""
import json
import os
import base64
import uuid
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        cur.execute(
            "SELECT w.*, u.full_name as creator_name FROM webinars w LEFT JOIN users u ON w.created_by = u.id ORDER BY w.created_at DESC"
        )
        webinars = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(w) for w in webinars], default=str),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        headers = event.get('headers', {})
        user_id = headers.get('x-user-id') or headers.get('X-User-Id')
        
        title = body.get('title', '').replace("'", "''")
        description = body.get('description', '').replace("'", "''")
        video_url = body.get('video_url', '').replace("'", "''")
        video_file_base64 = body.get('video_file_base64')
        thumbnail_url = body.get('thumbnail_url', '').replace("'", "''") if body.get('thumbnail_url') else 'NULL'
        duration = int(body.get('duration', 0))
        
        if video_file_base64:
            try:
                video_data = base64.b64decode(video_file_base64)
                
                s3 = boto3.client('s3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
                )
                
                unique_filename = f'videos/{uuid.uuid4()}.mp4'
                
                s3.put_object(
                    Bucket='files',
                    Key=unique_filename,
                    Body=video_data,
                    ContentType='video/mp4'
                )
                
                video_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{unique_filename}"
            except Exception as e:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Ошибка загрузки видео: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        if thumbnail_url == 'NULL':
            cur.execute(
                f"INSERT INTO webinars (title, description, video_url, thumbnail_url, duration, created_by) VALUES ('{title}', '{description}', '{video_url}', NULL, {duration}, {user_id}) RETURNING *"
            )
        else:
            cur.execute(
                f"INSERT INTO webinars (title, description, video_url, thumbnail_url, duration, created_by) VALUES ('{title}', '{description}', '{video_url}', '{thumbnail_url}', {duration}, {user_id}) RETURNING *"
            )
        webinar = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(webinar), default=str),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }