-- Добавляем поля для загрузки видео файлов
ALTER TABLE t_p85411794_lenarelo_geography_s.webinars 
ADD COLUMN IF NOT EXISTS video_file_url TEXT,
ADD COLUMN IF NOT EXISTS video_file_size BIGINT;

-- Добавляем таблицу для адресных домашних заданий (связь ДЗ с конкретными учениками)
CREATE TABLE IF NOT EXISTS t_p85411794_lenarelo_geography_s.homework_assignments (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER NOT NULL REFERENCES t_p85411794_lenarelo_geography_s.homework(id),
    student_id INTEGER NOT NULL REFERENCES t_p85411794_lenarelo_geography_s.users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(homework_id, student_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_homework_assignments_homework ON t_p85411794_lenarelo_geography_s.homework_assignments(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_assignments_student ON t_p85411794_lenarelo_geography_s.homework_assignments(student_id);