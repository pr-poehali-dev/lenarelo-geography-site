-- Таблица для кодов приглашений
CREATE TABLE IF NOT EXISTS invite_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0
);

-- Таблица расписания (календарь)
CREATE TABLE IF NOT EXISTS schedule (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time VARCHAR(20),
    homework_id INTEGER REFERENCES homework(id),
    webinar_id INTEGER REFERENCES webinars(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, title)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON invite_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(date);

-- Добавляем начальные коды для учителя
INSERT INTO invite_codes (code, is_active) VALUES 
('LENARELO', TRUE),
('GEO2024', TRUE),
('OGE2025', TRUE)
ON CONFLICT (code) DO NOTHING;