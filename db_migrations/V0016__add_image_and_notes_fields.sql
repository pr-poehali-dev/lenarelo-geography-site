-- Добавляем поле для картинок в вопросах
ALTER TABLE homework_questions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Добавляем поле для конспектов к вебинарам
ALTER TABLE webinars ADD COLUMN IF NOT EXISTS notes_url TEXT;