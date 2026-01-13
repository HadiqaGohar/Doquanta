
import sqlite3
import os

db_path = "todo-backend/todo.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Table List ---")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for table in tables:
    print(table[0])

print("\n--- Session Table Schema ---")
cursor.execute("PRAGMA table_info(session);")
columns = cursor.fetchall()
for col in columns:
    print(col)

print("\n--- Session Table Content (first 5) ---")
cursor.execute("SELECT * FROM session LIMIT 5;")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
