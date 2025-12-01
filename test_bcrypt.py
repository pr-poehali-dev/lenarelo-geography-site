import bcrypt

# Тест проверки пароля
password = "admin123"
stored_hash = "$2b$12$EuDgbKt3D21YVXz.8zrLLeJ7z9v9xN7KCWyqH5vK3q8jCG4V6PLzW"

result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
print(f"Password check result: {result}")

# Сгенерировать новый хеш
new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"New hash: {new_hash.decode('utf-8')}")

# Проверить новый хеш
new_result = bcrypt.checkpw(password.encode('utf-8'), new_hash)
print(f"New hash check result: {new_result}")
