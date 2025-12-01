"""
Business: Управление домашними заданиями (создание, получение, сдача)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
"""
import json
import os
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
        params = event.get('queryStringParameters') or {}
        action = params.get('action')
        
        if action == 'list':
            cur.execute(
                "SELECT h.*, u.full_name as creator_name FROM homework h LEFT JOIN users u ON h.created_by = u.id ORDER BY h.deadline ASC"
            )
            homework_list = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(h) for h in homework_list], default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'submissions':
            homework_id = params.get('homework_id')
            
            cur.execute("""
                SELECT hs.*, u.full_name as student_name, u.username
                FROM homework_submissions hs
                LEFT JOIN users u ON hs.user_id = u.id
                WHERE hs.homework_id = %s
                ORDER BY hs.submitted_at DESC
            """, (homework_id,))
            
            submissions = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in submissions], default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'stats':
            headers = event.get('headers', {})
            user_id = headers.get('x-user-id') or headers.get('X-User-Id')
            
            cur.execute("""
                SELECT 
                    COUNT(DISTINCT h.id) as total_homework,
                    COUNT(DISTINCT hs.homework_id) as submitted_homework,
                    AVG(hs.score) as average_score
                FROM homework h
                LEFT JOIN homework_submissions hs ON h.id = hs.homework_id AND hs.user_id = %s
            """, (user_id,))
            
            stats = cur.fetchone()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(stats), default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'my_submissions':
            headers = event.get('headers', {})
            user_id = headers.get('x-user-id') or headers.get('X-User-Id')
            
            cur.execute("""
                SELECT hs.*, h.title as homework_title
                FROM homework_submissions hs
                LEFT JOIN homework h ON hs.homework_id = h.id
                WHERE hs.user_id = %s
                ORDER BY hs.submitted_at DESC
            """, (user_id,))
            
            submissions = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in submissions], default=str),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        headers = event.get('headers', {})
        user_id = headers.get('x-user-id') or headers.get('X-User-Id')
        action = body.get('action')
        
        if action == 'create':
            title = body.get('title')
            description = body.get('description')
            homework_type = body.get('homework_type')
            deadline = body.get('deadline')
            questions = body.get('questions', [])
            
            cur.execute(
                "INSERT INTO homework (title, description, homework_type, deadline, created_by) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (title, description, homework_type, deadline, user_id)
            )
            homework = cur.fetchone()
            homework_id = homework['id']
            
            if homework_type == 'test' and questions:
                for idx, q in enumerate(questions):
                    cur.execute(
                        "INSERT INTO homework_questions (homework_id, question_text, options, correct_answer, order_num) VALUES (%s, %s, %s, %s, %s)",
                        (homework_id, q.get('question'), json.dumps(q.get('options')), q.get('correct'), idx)
                    )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(homework), default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'submit':
            homework_id = body.get('homework_id')
            submission_type = body.get('submission_type')
            submission_data = body.get('submission_data')
            file_url = body.get('file_url')
            
            cur.execute(
                "INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (homework_id, user_id, submission_type, json.dumps(submission_data) if submission_data else None, file_url)
            )
            submission = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(submission), default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'grade':
            submission_id = body.get('submission_id')
            score = body.get('score')
            feedback = body.get('feedback', '')
            
            cur.execute(
                "UPDATE homework_submissions SET score = %s, feedback = %s WHERE id = %s RETURNING *",
                (score, feedback, submission_id)
            )
            submission = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(submission), default=str),
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