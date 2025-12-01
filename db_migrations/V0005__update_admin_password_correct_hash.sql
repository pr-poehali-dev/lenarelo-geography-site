-- Обновить пароль админа на правильный (admin123)
-- Хеш сгенерирован через bcrypt.hashpw('admin123'.encode(), bcrypt.gensalt())
UPDATE users 
SET password_hash = '$2b$12$EuDgbKt3D21YVXz.8zrLLeJ7z9v9xN7KCWyqH5vK3q8jCG4V6PLzW'
WHERE username = 'admin';