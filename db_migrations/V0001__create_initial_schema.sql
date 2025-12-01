-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create webinars table
CREATE TABLE IF NOT EXISTS webinars (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create homework table
CREATE TABLE IF NOT EXISTS homework (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    homework_type VARCHAR(20) NOT NULL CHECK (homework_type IN ('file', 'test', 'text')),
    deadline TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create homework_questions table (for test type)
CREATE TABLE IF NOT EXISTS homework_questions (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER REFERENCES homework(id),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    order_num INTEGER
);

-- Create homework_submissions table
CREATE TABLE IF NOT EXISTS homework_submissions (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER REFERENCES homework(id),
    user_id INTEGER REFERENCES users(id),
    submission_type VARCHAR(20) NOT NULL,
    submission_data JSONB,
    file_url TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score INTEGER,
    feedback TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_homework_deadline ON homework(deadline);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON homework_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_homework ON homework_submissions(homework_id);

-- Insert admin user (password: admin123)
INSERT INTO users (username, password_hash, email, full_name, is_admin) 
VALUES ('admin', '$2b$10$rZ8qNqZ5fKp4Y3x8Z5Y3x8Z5Y3x8Z5Y3x8Z5Y3x8Z5Y3x8Z5Y3x8Z', 'admin@lenarelo.ru', 'Администратор', TRUE)
ON CONFLICT (username) DO NOTHING;