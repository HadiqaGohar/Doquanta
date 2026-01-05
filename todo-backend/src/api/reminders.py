from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from ..db.session import get_session
from ..models.models import User, Task, TaskReminder
from ..core.security import get_current_user_id
from uuid import uuid4
import asyncio



router = APIRouter(prefix="/api/reminders", tags=["reminders"])


class TaskReminderCreate(BaseModel):
    task_id: int
    scheduled_time: datetime


class TaskReminderUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    sent: Optional[bool] = None


@router.post("/", response_model=TaskReminder)
def create_task_reminder(
    *,
    reminder_data: TaskReminderCreate,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Create a new task reminder."""
    # Verify that the task belongs to the user
    task_statement = select(Task).where(
        Task.id == reminder_data.task_id,
        Task.user_id == current_user_id
    )
    task = db_session.exec(task_statement).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    reminder_id = str(uuid4())

    task_reminder = TaskReminder(
        id=reminder_id,
        task_id=reminder_data.task_id,
        user_id=current_user_id,
        scheduled_time=reminder_data.scheduled_time,
        created_at=datetime.now()
    )

    db_session.add(task_reminder)
    db_session.commit()
    db_session.refresh(task_reminder)

    # Trigger the scheduler to check for new reminders
    # This ensures the new reminder is processed in the next cycle
    try:
        from ..tasks.background import schedule_reminder_check
        # The scheduler runs automatically every minute via Celery beat
        # But we can also trigger an immediate check if needed
    except ImportError:
        # In case Celery is not available, log a warning
        print("Warning: Could not import Celery scheduler. Reminders may not be processed.")

    return task_reminder


@router.get("/", response_model=List[TaskReminder])
def list_task_reminders(
    *,
    current_user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db_session: Session = Depends(get_session)
):
    """List all task reminders for the authenticated user."""
    statement = select(TaskReminder).where(TaskReminder.user_id == current_user_id)
    reminders = db_session.exec(statement).all()
    return reminders


@router.get("/{reminder_id}", response_model=TaskReminder)
def get_task_reminder(
    *,
    reminder_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Get a specific task reminder."""
    statement = select(TaskReminder).where(
        TaskReminder.id == reminder_id,
        TaskReminder.user_id == current_user_id
    )
    reminder = db_session.exec(statement).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Task reminder not found")

    return reminder


@router.put("/{reminder_id}", response_model=TaskReminder)
def update_task_reminder(
    *,
    reminder_id: str,
    reminder_update: TaskReminderUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Update a task reminder."""
    statement = select(TaskReminder).where(
        TaskReminder.id == reminder_id,
        TaskReminder.user_id == current_user_id
    )
    reminder = db_session.exec(statement).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Task reminder not found")

    # Update fields if provided
    if reminder_update.scheduled_time is not None:
        reminder.scheduled_time = reminder_update.scheduled_time
    if reminder_update.sent is not None:
        reminder.sent = reminder_update.sent
        if reminder_update.sent:
            reminder.sent_at = datetime.now()

    db_session.add(reminder)
    db_session.commit()
    db_session.refresh(reminder)

    return reminder


@router.delete("/{reminder_id}")
def delete_task_reminder(
    *,
    reminder_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Delete a task reminder."""
    statement = select(TaskReminder).where(
        TaskReminder.id == reminder_id,
        TaskReminder.user_id == current_user_id
    )
    reminder = db_session.exec(statement).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Task reminder not found")

    db_session.delete(reminder)
    db_session.commit()

    return {"message": "Task reminder deleted successfully"}


@router.get("/upcoming", response_model=List[TaskReminder])
def get_upcoming_reminders(
    *,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Get all upcoming (not sent) task reminders for the authenticated user."""
    statement = select(TaskReminder).where(
        TaskReminder.user_id == current_user_id,
        TaskReminder.sent == False,
        TaskReminder.scheduled_time >= datetime.now()
    ).order_by(TaskReminder.scheduled_time)

    reminders = db_session.exec(statement).all()
    return reminders