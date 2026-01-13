from sqlmodel import SQLModel, Session, select, create_engine
from datetime import datetime, timezone
import os
from todo_backend.src.models.models import Task

# Setup simple in-memory DB or use existing
db_path = "todo-backend/todo.db"
sqlite_url = f"sqlite:///{db_path}"
engine = create_engine(sqlite_url)

def test_datetime_storage():
    with Session(engine) as session:
        # Create a dummy user if not exists (simplification)
        user_id = "test_user_debug"
        
        # Test 1: Timezone Aware (UTC)
        dt_aware = datetime(2023, 1, 10, 5, 0, 0, tzinfo=timezone.utc)
        print(f"Original Aware: {dt_aware}, ISO: {dt_aware.isoformat()}")
        
        task = Task(
            user_id=user_id,
            title="Debug Task",
            due_date=dt_aware,
            reminder_time=dt_aware
        )
        
        # We won't actually commit to avoid polluting DB, just check object state
        # But to test SQLite behavior we need to insert.
        # Let's just inspect existing tasks to see how they are stored.
        
        statement = select(Task).limit(1)
        existing_task = session.exec(statement).first()
        
        if existing_task:
            print(f"\nExisting Task ID: {existing_task.id}")
            print(f"Due Date (Raw): {existing_task.due_date!r}")
            print(f"Due Date (Str): {existing_task.due_date}")
            if existing_task.due_date:
                print(f"Tzinfo: {existing_task.due_date.tzinfo}")
                print(f"ISO Format: {existing_task.due_date.isoformat()}")
        else:
            print("No tasks found.")

if __name__ == "__main__":
    test_datetime_storage()
