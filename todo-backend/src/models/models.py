from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel

class User(SQLModel, table=True):
    """User model (managed by Better Auth in frontend, but referenced in backend)."""
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    tasks: list["Task"] = Relationship(back_populates="user")
    chat_sessions: list["ChatSession"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    """Todo task model with user ownership."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium")
    category: str = Field(default="other")

    due_date: Optional[datetime] = Field(default=None)
    reminder_time: Optional[datetime] = Field(default=None)

    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = Field(default=None) # daily, weekly, etc.
    recurrence_interval: Optional[int] = Field(default=None)
    recurrence_end_date: Optional[datetime] = Field(default=None)
    max_occurrences: Optional[int] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship(back_populates="tasks")

class ChatSession(SQLModel, table=True):
    """Chat session model to track conversations."""
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(default="New Chat")
    description: Optional[str] = Field(default="")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship(back_populates="chat_sessions")
    messages: list["ChatMessage"] = Relationship(back_populates="session")

class ChatMessage(SQLModel, table=True):
    """Chat message model to store conversation history."""
    id: str = Field(primary_key=True)
    session_id: str = Field(foreign_key="chatsession.id", index=True)
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    session: Optional[ChatSession] = Relationship(back_populates="messages")

class TaskReminder(SQLModel, table=True):
    """Task reminder model to track scheduled reminders."""
    id: str = Field(primary_key=True)
    task_id: int = Field(foreign_key="task.id", index=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    scheduled_time: datetime
    sent: bool = Field(default=False)
    sent_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship()
    task: Optional[Task] = Relationship()


class Notification(SQLModel, table=True):
    """Notification model to track user notifications."""
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=255)
    message: str
    type: str = Field(default="info", max_length=20)  # 'info', 'success', 'warning', 'error'
    is_read: bool = Field(default=False)
    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship()

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    recurrence_interval: Optional[int] = None
    recurrence_end_date: Optional[datetime] = None
    max_occurrences: Optional[int] = None
