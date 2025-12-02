-- Обновляем пароль админа правильным хешем из test-bcrypt функции
UPDATE users 
SET password_hash = '$2b$12$qAFW/bbC1.698SgBA8Z.kOodGvK7EcgCZvdEAiC9YeH0djWlJaxHu'
WHERE username = 'admin';