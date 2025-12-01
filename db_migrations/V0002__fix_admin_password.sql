-- Update admin password to bcrypt hash for 'admin123'
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfYGZ3rZDK'
WHERE username = 'admin';
