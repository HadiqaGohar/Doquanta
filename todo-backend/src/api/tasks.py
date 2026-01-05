from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from ..db.session import get_session
from ..models.models import Task, TaskUpdate
from ..core.security import get_current_user_id


router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])

def verify_user_match(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Ensure the user_id in path matches the authenticated user's ID."""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this user's tasks"
        )
    return current_user_id

@router.post("/", response_model=Task)
def create_task(
    *,
    user_id: str,
    task: Task,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
):
    """Create a new task for the authenticated user."""
    task.user_id = current_user_id
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.get("/", response_model=List[Task])
def list_tasks(
    *,
    user_id: str,
    completed: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
):
    """List all tasks for the authenticated user."""
    statement = select(Task).where(Task.user_id == current_user_id)
    if completed is not None:
        statement = statement.where(Task.completed == completed)
    if priority:
        statement = statement.where(Task.priority == priority)
    if category:
        statement = statement.where(Task.category == category)
    
    tasks = session.exec(statement).all()
    return tasks

@router.get("/{task_id}", response_model=Task)
def get_task(
    *,
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
):
    """Get a specific task by ID."""
    task = session.get(Task, task_id)
    if not task or task.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=Task)
def update_task(
    *,
    user_id: str,
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
):
    """Update an existing task."""
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

@router.delete("/{task_id}")
def delete_task(
    *,
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
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
    user_id: str,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
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

@router.patch("/{task_id}/complete", response_model=Task)
def toggle_task_complete(
    *,
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(verify_user_match)
):
    """Toggle the completion status of a task."""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != current_user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.completed = not db_task.completed
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task