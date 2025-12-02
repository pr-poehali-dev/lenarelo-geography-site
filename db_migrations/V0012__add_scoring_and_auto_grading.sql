-- Добавляем систему баллов для домашних заданий
ALTER TABLE homework ADD COLUMN max_score INTEGER DEFAULT 1;

-- Добавляем поддержку автоматической проверки тестов
ALTER TABLE homework_submissions ADD COLUMN is_auto_graded BOOLEAN DEFAULT FALSE;