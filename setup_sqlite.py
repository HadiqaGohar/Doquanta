
import sqlite3
import os

db_path = "todo-backend/todo.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Better Auth tables
tables = [
    """
    CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        emailVerified BOOLEAN NOT NULL,
        image TEXT,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        expiresAt DATETIME NOT NULL,
        token TEXT NOT NULL UNIQUE,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        userId TEXT NOT NULL REFERENCES user(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS account (
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
    """,
    """
    CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME,
        updatedAt DATETIME
    )
    """
]

for table_sql in tables:
    try:
        cursor.execute(table_sql)
        print("Ensured table exists.")
    except Exception as e:
        print(f"Error creating table: {e}")

conn.commit()
conn.close()
print("Database schema updated for SQLite.")
