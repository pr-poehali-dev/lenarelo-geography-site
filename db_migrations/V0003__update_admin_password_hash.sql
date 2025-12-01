-- Update admin password to correct bcrypt hash for 'admin123'
-- Generated with: bcrypt.hashpw(b'admin123', bcrypt.gensalt())
UPDATE users 
SET password_hash = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
WHERE username = 'admin';
