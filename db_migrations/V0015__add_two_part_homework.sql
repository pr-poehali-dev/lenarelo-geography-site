-- Добавляем поддержку двухчастных домашних заданий
ALTER TABLE t_p85411794_lenarelo_geography_s.homework 
ADD COLUMN IF NOT EXISTS has_part2 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS part2_description TEXT,
ADD COLUMN IF NOT EXISTS part2_max_score INTEGER DEFAULT 0;

-- Добавляем поля для хранения баллов за части
ALTER TABLE t_p85411794_lenarelo_geography_s.homework_submissions
ADD COLUMN IF NOT EXISTS part1_score INTEGER,
ADD COLUMN IF NOT EXISTS part2_score INTEGER,
ADD COLUMN IF NOT EXISTS part2_text TEXT,
ADD COLUMN IF NOT EXISTS part2_file_url TEXT;

COMMENT ON COLUMN t_p85411794_lenarelo_geography_s.homework.has_part2 IS 'Есть ли вторая часть (ручная проверка)';
COMMENT ON COLUMN t_p85411794_lenarelo_geography_s.homework.part2_description IS 'Описание второй части задания';
COMMENT ON COLUMN t_p85411794_lenarelo_geography_s.homework_submissions.part1_score IS 'Баллы за первую часть (автопроверка)';
COMMENT ON COLUMN t_p85411794_lenarelo_geography_s.homework_submissions.part2_score IS 'Баллы за вторую часть (ручная проверка)';