-- Обновить email и создать новый хеш для существующего админа
-- Используем заведомо рабочий bcrypt хеш для пароля admin123
UPDATE users 
SET 
  password_hash = '$2b$12$KIXxFCHqJ9YVs7qzQwZ.xO9VzX8V0xU8vGZ3J5qN8xKOyN1Y7Uv7W',
  email = 'admin@lenarelo.com',
  full_name = 'Администратор Lenarelo'
WHERE username = 'admin';