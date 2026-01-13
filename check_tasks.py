
import sqlite3

db_path = "todo-backend/todo.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- All Tasks ---")
cursor.execute("SELECT id, user_id, title, completed FROM task")
rows = cursor.fetchall()
for row in rows:
    print(row)

print("\n--- All Users ---")
cursor.execute("SELECT id, email FROM user")
rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
