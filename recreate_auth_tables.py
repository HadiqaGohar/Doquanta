
import sqlite3
import shutil
import os

db_path = "todo-backend/todo.db"
backup_path = "todo-backend/todo.db.bak"

# 1. Backup
shutil.copy2(db_path, backup_path)
print(f"Backup created at {backup_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 2. Drop existing auth tables
tables_to_drop = ["user", "session", "account", "verification"]
for table in tables_to_drop:
    cursor.execute(f"DROP TABLE IF EXISTS {table}")
    print(f"Dropped table {table}")

# 3. Create fresh Better Auth tables with EXACT SQLite schema
# Note: Better Auth SQLite uses camelCase for columns
cursor.execute("""
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified BOOLEAN NOT NULL,
    image TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
)
""")

cursor.execute("""
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    expiresAt DATETIME NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id)
)
""")

cursor.execute("""
CREATE TABLE account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id),
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt DATETIME,
    refreshTokenExpiresAt DATETIME,
    scope TEXT,
    password TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
)
""")

cursor.execute("""
CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME,
    updatedAt DATETIME
)
""")

print("Better Auth tables recreated successfully with camelCase columns.")

conn.commit()
conn.close()
