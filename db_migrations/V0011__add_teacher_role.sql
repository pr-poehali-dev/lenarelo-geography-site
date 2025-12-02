-- Добавляем поле is_teacher для учительских аккаунтов
ALTER TABLE users ADD COLUMN is_teacher BOOLEAN DEFAULT FALSE;

-- Делаем аккаунт admin учительским
UPDATE users SET is_teacher = TRUE WHERE username = 'admin';