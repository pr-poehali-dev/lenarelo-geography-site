-- Обновить пароль админа (admin123)
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBPz.E4w8K3VJ2eH5tYQZjKxqL8mZ3vU9qN8fE4yD6xO5m'
WHERE username = 'admin';

-- Удалить регистрацию - только админ может добавлять пользователей
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by INTEGER REFERENCES users(id);