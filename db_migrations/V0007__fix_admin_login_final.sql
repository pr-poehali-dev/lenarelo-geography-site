-- Обновление пароля администратора на проверенный хеш
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yYqS6VWYvXKvT8s.iJZQkU3h5k0W8F9hLG6x3n3jXhZJXmO'
WHERE username = 'admin';