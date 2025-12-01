-- Создание нового тестового админа
INSERT INTO users (username, password_hash, email, full_name, is_admin) 
VALUES ('testadmin', '$2b$12$LQv3c1yYqS6VWYvXKvT8s.iJZQkU3h5k0W8F9hLG6x3n3jXhZJXmO', 'testadmin@lenarelo.com', 'Test Admin', TRUE)
ON CONFLICT (username) DO NOTHING;