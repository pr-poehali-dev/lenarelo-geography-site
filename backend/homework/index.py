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
            headers = event.get('headers', {})
            user_id = headers.get('x-user-id') or headers.get('X-User-Id')
            
            if user_id:
                user_id_int = int(user_id)
                cur.execute(
                    f"""
                    SELECT h.*, u.full_name as creator_name 
                    FROM homework h 
                    LEFT JOIN users u ON h.created_by = u.id 
                    LEFT JOIN homework_assignments ha ON h.id = ha.homework_id
                    WHERE ha.homework_id IS NULL OR ha.student_id = {user_id_int}
                    GROUP BY h.id, u.full_name
                    ORDER BY h.deadline ASC
                    """
                )
            else:
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
            
            homework_id_int = int(homework_id)
            cur.execute(f"""
                SELECT hs.*, u.full_name as student_name, u.username
                FROM homework_submissions hs
                LEFT JOIN users u ON hs.user_id = u.id
                WHERE hs.homework_id = {homework_id_int}
                ORDER BY hs.submitted_at DESC
            """)
            
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
            
            user_id_int = int(user_id)
            cur.execute(f"""
                SELECT 
                    COUNT(DISTINCT h.id) as total_homework,
                    COUNT(DISTINCT hs.homework_id) as submitted_homework,
                    AVG(hs.score) as average_score
                FROM homework h
                LEFT JOIN homework_submissions hs ON h.id = hs.homework_id AND hs.user_id = {user_id_int}
            """)
            
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
            
            user_id_int = int(user_id)
            cur.execute(f"""
                SELECT hs.*, h.title as homework_title
                FROM homework_submissions hs
                LEFT JOIN homework h ON hs.homework_id = h.id
                WHERE hs.user_id = {user_id_int}
                ORDER BY hs.submitted_at DESC
            """)
            
            submissions = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in submissions], default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'get_questions':
            homework_id = params.get('homework_id')
            homework_id_int = int(homework_id)
            
            cur.execute(f"""
                SELECT * FROM homework_questions 
                WHERE homework_id = {homework_id_int}
                ORDER BY order_num ASC
            """)
            
            questions = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(q) for q in questions], default=str),
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
            max_score = body.get('max_score', 1)
            
            title_esc = title.replace("'", "''")
            description_esc = description.replace("'", "''")
            homework_type_esc = homework_type.replace("'", "''")
            deadline_esc = deadline.replace("'", "''")
            user_id_int = int(user_id)
            max_score_int = int(max_score)
            
            cur.execute(
                f"INSERT INTO homework (title, description, homework_type, deadline, created_by, max_score) VALUES ('{title_esc}', '{description_esc}', '{homework_type_esc}', '{deadline_esc}', {user_id_int}, {max_score_int}) RETURNING *"
            )
            homework = cur.fetchone()
            homework_id = homework['id']
            
            if homework_type == 'test' and questions:
                for idx, q in enumerate(questions):
                    question_esc = q.get('question', '').replace("'", "''")
                    options_json = json.dumps(q.get('options')).replace("'", "''")
                    correct_esc = q.get('correct', '').replace("'", "''")
                    cur.execute(
                        f"INSERT INTO homework_questions (homework_id, question_text, options, correct_answer, order_num) VALUES ({homework_id}, '{question_esc}', '{options_json}', '{correct_esc}', {idx})"
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
            
            homework_id_int = int(homework_id)
            user_id_int = int(user_id)
            submission_type_esc = submission_type.replace("'", "''")
            submission_data_json = json.dumps(submission_data).replace("'", "''") if submission_data else 'NULL'
            file_url_esc = file_url.replace("'", "''") if file_url else 'NULL'
            
            auto_score = None
            is_auto_graded = False
            
            if submission_type == 'test' and submission_data:
                cur.execute(f"SELECT * FROM homework_questions WHERE homework_id = {homework_id_int} ORDER BY order_num ASC")
                questions = cur.fetchall()
                
                cur.execute(f"SELECT max_score FROM homework WHERE id = {homework_id_int}")
                hw = cur.fetchone()
                max_score = hw['max_score'] if hw else 1
                
                if questions:
                    correct_count = 0
                    for q in questions:
                        q_id = str(q['id'])
                        user_answer = submission_data.get(q_id)
                        if user_answer is not None and int(user_answer) == int(q['correct_answer']):
                            correct_count += 1
                    
                    auto_score = int((correct_count / len(questions)) * max_score) if len(questions) > 0 else 0
                    is_auto_graded = True
            
            if submission_data_json == 'NULL' and file_url_esc == 'NULL':
                if is_auto_graded:
                    cur.execute(
                        f"INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url, score, is_auto_graded) VALUES ({homework_id_int}, {user_id_int}, '{submission_type_esc}', NULL, NULL, {auto_score}, TRUE) RETURNING *"
                    )
                else:
                    cur.execute(
                        f"INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url, is_auto_graded) VALUES ({homework_id_int}, {user_id_int}, '{submission_type_esc}', NULL, NULL, FALSE) RETURNING *"
                    )
            elif submission_data_json == 'NULL':
                cur.execute(
                    f"INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url, is_auto_graded) VALUES ({homework_id_int}, {user_id_int}, '{submission_type_esc}', NULL, '{file_url_esc}', FALSE) RETURNING *"
                )
            elif file_url_esc == 'NULL':
                if is_auto_graded:
                    cur.execute(
                        f"INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url, score, is_auto_graded) VALUES ({homework_id_int}, {user_id_int}, '{submission_type_esc}', '{submission_data_json}', NULL, {auto_score}, TRUE) RETURNING *"
                    )
                else:
                    cur.execute(
                        f"INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url, is_auto_graded) VALUES ({homework_id_int}, {user_id_int}, '{submission_type_esc}', '{submission_data_json}', NULL, FALSE) RETURNING *"
                    )
            else:
                cur.execute(
                    f"INSERT INTO homework_submissions (homework_id, user_id, submission_type, submission_data, file_url, is_auto_graded) VALUES ({homework_id_int}, {user_id_int}, '{submission_type_esc}', '{submission_data_json}', '{file_url_esc}', FALSE) RETURNING *"
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
            
            score_val = int(score) if score else 'NULL'
            feedback_esc = feedback.replace("'", "''")
            submission_id_int = int(submission_id)
            
            if score_val == 'NULL':
                cur.execute(
                    f"UPDATE homework_submissions SET score = NULL, feedback = '{feedback_esc}' WHERE id = {submission_id_int} RETURNING *"
                )
            else:
                cur.execute(
                    f"UPDATE homework_submissions SET score = {score_val}, feedback = '{feedback_esc}' WHERE id = {submission_id_int} RETURNING *"
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
        
        elif action == 'assign':
            homework_id = body.get('homework_id')
            student_ids = body.get('student_ids', [])
            
            homework_id_int = int(homework_id)
            
            for student_id in student_ids:
                student_id_int = int(student_id)
                cur.execute(
                    f"INSERT INTO homework_assignments (homework_id, student_id) VALUES ({homework_id_int}, {student_id_int}) ON CONFLICT DO NOTHING"
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'assigned': len(student_ids)}),
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