-- Обновляем пароль админа хешем, полученным из рабочей функции
-- Хеш для пароля: admin123
UPDATE users 
SET password_hash = '$2b$12$dQw4CZJ8XY.Z3qF0KxP9GuP7FvGxMmN9YYvY3PxLxpB3f8HKzQXO6'
WHERE username = 'admin';