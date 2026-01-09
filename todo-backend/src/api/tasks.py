from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from ..db.session import get_session
from ..models.models import Task, TaskUpdate
from ..core.security import get_current_user_id
import traceback

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

def verify_user_access(current_user_id: str = Depends(get_current_user_id)):
    """Get the authenticated user's ID."""
    return current_user_id

@router.post("/", response_model=Task)
def create_task(
    *,
    task_data: dict,  # Receive as dict first to handle potential parsing issues
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Create a new task for the authenticated user."""
    try:
        print(f"DEBUG: Creating task for user {current_user_id}, data: {task_data}")
        
        # Manually construct the Task object to avoid validation issues with ID/dates
        # and ensure user_id is set correctly.
        
        # Handle due_date parsing if it's a string
        due_date = task_data.get("due_date")
        if isinstance(due_date, str) and due_date:
            try:
                # Remove 'Z' and replace with +00:00 for ISO format compatibility
                due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except Exception as e:
                print(f"DEBUG: Date parsing error: {e}")
                # Fallback or leave as is if already a datetime (though likely a string)

        # Handle reminder_time parsing if it's a string
        reminder_time = task_data.get("reminder_time")
        if isinstance(reminder_time, str) and reminder_time:
            try:
                # Remove 'Z' and replace with +00:00 for ISO format compatibility
                reminder_time = datetime.fromisoformat(reminder_time.replace('Z', '+00:00'))
            except Exception as e:
                print(f"DEBUG: Reminder time parsing error: {e}")
        
        db_task = Task(
            user_id=current_user_id,
            title=task_data.get("title"),
            description=task_data.get("description", ""),
            completed=task_data.get("completed", False),
            priority=task_data.get("priority", "medium"),
            category=task_data.get("category", "other"),
            due_date=due_date,
            reminder_time=reminder_time,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            is_recurring=task_data.get("is_recurring", False),
            recurrence_pattern=task_data.get("recurrence_pattern"),
            recurrence_end_date=task_data.get("recurrence_end_date"),
            recurrence_interval=task_data.get("recurrence_interval"),
            max_occurrences=task_data.get("max_occurrences"),
        )
        
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task
    except Exception as e:
        print(f"CRITICAL ERROR in create_task: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Task])
def list_tasks(
    *,
    completed: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """List all tasks for the authenticated user."""
    try:
        statement = select(Task).where(Task.user_id == current_user_id)
        if completed is not None:
            statement = statement.where(Task.completed == completed)
        if priority:
            statement = statement.where(Task.priority == priority)
        if category:
            statement = statement.where(Task.category == category)
        
        tasks = session.exec(statement).all()
        return tasks
    except Exception as e:
        print(f"ERROR in list_tasks: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}", response_model=Task)
def get_task(
    *,
    task_id: int,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Get a specific task by ID."""
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=Task)
def update_task(
    *,
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Update an existing task."""
    try:
        db_task = session.get(Task, task_id)
        if not db_task or db_task.user_id != current_user_id:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task_data = task_update.model_dump(exclude_unset=True)
        for key, value in task_data.items():
            setattr(db_task, key, value)
        
        db_task.updated_at = datetime.now(timezone.utc)
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task
    except Exception as e:
        print(f"ERROR in update_task: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
def delete_task(
    *,
    task_id: int,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Delete a task."""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    session.delete(db_task)
    session.commit()
    return {"message": "Task deleted successfully"}

@router.delete("/completed/clear")
def delete_completed_tasks(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Delete all completed tasks for the authenticated user."""
    statement = select(Task).where(Task.user_id == current_user_id).where(Task.completed == True)
    completed_tasks = session.exec(statement).all()
    
    count = 0
    for task in completed_tasks:
        session.delete(task)
        count += 1
    
    session.commit()
    return {"message": f"Successfully deleted {count} completed tasks", "count": count}

@router.delete("/all/clear")
def delete_all_tasks(
    *,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Delete ALL tasks for the authenticated user (Danger Zone)."""
    statement = select(Task).where(Task.user_id == current_user_id)
    all_tasks = session.exec(statement).all()
    
    count = 0
    for task in all_tasks:
        session.delete(task)
        count += 1
    
    session.commit()
    return {"message": f"Successfully deleted {count} tasks", "count": count}

@router.patch("/{task_id}/complete", response_model=Task)
def toggle_task_complete(
    *,
    task_id: int,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_access)
):
    """Toggle the completion status of a task."""
    try:
        print(f"DEBUG: Toggling task {task_id} for user {current_user_id}")
        db_task = session.get(Task, task_id)
        
        if not db_task:
            print(f"DEBUG: Task {task_id} not found in database")
            raise HTTPException(status_code=404, detail="Task not found in DB")
            
        if db_task.user_id != current_user_id:
            print(f"DEBUG: Task {task_id} owner mismatch. Owner: {db_task.user_id}, Current: {current_user_id}")
            raise HTTPException(status_code=403, detail="Not authorized to access this task")
        
        db_task.completed = not db_task.completed
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        print(f"DEBUG: Task {task_id} toggled to {db_task.completed}")
        return db_task
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in toggle_task_complete: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
