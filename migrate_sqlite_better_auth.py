
import sqlite3

db_path = "todo-backend/todo.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column(table, column, type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type}")
        print(f"Added column {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding column {column}: {e}")

# Add missing columns for Better Auth in 'user' table
add_column("user", "emailVerified", "BOOLEAN NOT NULL DEFAULT 0")
add_column("user", "image", "TEXT")
add_column("user", "createdAt", "DATETIME")
add_column("user", "updatedAt", "DATETIME")

# Ensure 'session' table has all Better Auth columns
# The previous script might have failed to add columns to an existing table
add_column("session", "ipAddress", "TEXT")
add_column("session", "userAgent", "TEXT")

conn.commit()
conn.close()
print("Migration completed.")
