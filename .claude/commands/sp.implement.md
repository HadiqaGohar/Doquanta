# Implementation Guide: Hackathon II - The Evolution of Todo – Mastering Spec-Driven Development & Cloud Native AI

## Implementation Overview

This document provides a comprehensive guide to implementing the Hackathon II project, following the Constitution, Plan, and Tasks specifications. It details the step-by-step approach for each phase, implementation patterns, and best practices for successful execution.

## Implementation Principles

### 1. Spec-First Development
- Always implement from approved specifications
- Reference specific task IDs in all code comments
- Maintain traceability from spec to implementation
- Update specifications when requirements change

### 2. AI-Assisted Implementation
- Use Claude Code for all code generation
- Refine specifications until Claude Code produces correct output
- Leverage MCP tools for development tasks
- Maintain human oversight for quality assurance

### 3. Quality Standards
- Follow established coding conventions
- Implement comprehensive testing
- Maintain security best practices
- Ensure proper documentation

## Phase I Implementation: In-Memory Python Console App

### Step 1: Project Setup
```
# Initialize Python project with UV
uv init todo-app
cd todo-app
uv add python==3.13.*
```

**Implementation Tasks:**
1. Create proper directory structure:
   - `src/todo/` - Application source code
   - `tests/` - Test files
   - `docs/` - Documentation
   - `pyproject.toml` - Project configuration

2. Configure UV for dependency management
3. Set up version control with proper gitignore

### Step 2: Core Models Implementation
**File:** `src/todo/models.py`

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Task(BaseModel):
    """
    Task model representing a todo item.
    
    [Task]: 1.2
    [From]: spec/task-crud.md, plan/backend-architecture.md
    """
    id: int
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    def mark_complete(self):
        self.completed = True
        self.updated_at = datetime.now()
        
    def update(self, title: Optional[str] = None, description: Optional[str] = None):
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        self.updated_at = datetime.now()
```

### Step 3: In-Memory Storage Implementation
**File:** `src/todo/storage.py`

```python
from typing import Dict, List, Optional
from .models import Task

class TaskManager:
    """
    In-memory task storage manager.
    
    [Task]: 1.3
    [From]: spec/task-crud.md, plan/storage-architecture.md
    """
    def __init__(self):
        self._tasks: Dict[int, Task] = {}
        self._next_id = 1
    
    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        task = Task(
            id=self._next_id,
            title=title,
            description=description
        )
        self._tasks[task.id] = task
        self._next_id += 1
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        return self._tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        return list(self._tasks.values())
    
    def update_task(self, task_id: int, title: Optional[str] = None, 
                    description: Optional[str] = None) -> Optional[Task]:
        task = self._tasks.get(task_id)
        if task:
            task.update(title, description)
            return task
        return None
    
    def delete_task(self, task_id: int) -> bool:
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False
    
    def mark_task_complete(self, task_id: int) -> Optional[Task]:
        task = self._tasks.get(task_id)
        if task:
            task.mark_complete()
            return task
        return None
```

### Step 4: CLI Interface Implementation
**File:** `src/todo/cli.py`

```python
import cmd
from typing import List
from .storage import TaskManager
from .models import Task

class TodoCLI(cmd.Cmd):
    """
    Command-line interface for the todo application.
    
    [Task]: 1.4
    [From]: spec/console-interface.md, plan/cli-architecture.md
    """
    intro = 'Welcome to the Todo CLI. Type help or ? to list commands.\n'
    prompt = '(todo) '
    
    def __init__(self):
        super().__init__()
        self.manager = TaskManager()
    
    def do_add(self, arg: str):
        """Add a new task: add <title> [description]"""
        args = arg.split(maxsplit=1)
        if not args:
            print("Usage: add <title> [description]")
            return
        
        title = args[0]
        description = args[1] if len(args) > 1 else None
        task = self.manager.add_task(title, description)
        print(f"Added task {task.id}: {task.title}")
    
    def do_list(self, arg: str):
        """List all tasks: list"""
        tasks = self.manager.get_all_tasks()
        if not tasks:
            print("No tasks found.")
            return
        
        for task in tasks:
            status = "✓" if task.completed else "○"
            print(f"{status} [{task.id}] {task.title}")
            if task.description:
                print(f"    {task.description}")
    
    def do_complete(self, arg: str):
        """Mark task as complete: complete <id>"""
        try:
            task_id = int(arg)
            task = self.manager.mark_task_complete(task_id)
            if task:
                print(f"Completed task {task.id}: {task.title}")
            else:
                print(f"Task {task_id} not found.")
        except ValueError:
            print("Usage: complete <id>")
    
    def do_delete(self, arg: str):
        """Delete a task: delete <id>"""
        try:
            task_id = int(arg)
            if self.manager.delete_task(task_id):
                print(f"Deleted task {task_id}")
            else:
                print(f"Task {task_id} not found.")
        except ValueError:
            print("Usage: delete <id>")
    
    def do_update(self, arg: str):
        """Update task: update <id> <new_title> [new_description]"""
        args = arg.split(maxsplit=2)
        if len(args) < 2:
            print("Usage: update <id> <new_title> [new_description]")
            return
        
        try:
            task_id = int(args[0])
            title = args[1]
            description = args[2] if len(args) > 2 else None
            
            task = self.manager.update_task(task_id, title, description)
            if task:
                print(f"Updated task {task.id}: {task.title}")
            else:
                print(f"Task {task_id} not found.")
        except ValueError:
            print("Usage: update <id> <new_title> [new_description]")
    
    def do_quit(self, arg: str):
        """Exit the application: quit"""
        print("Goodbye!")
        return True
    
    def do_exit(self, arg: str):
        """Exit the application: exit"""
        return self.do_quit(arg)
```

### Step 5: Main Application Entry Point
**File:** `src/main.py`

```python
#!/usr/bin/env python3
"""
Main entry point for the Todo CLI application.

[Task]: 1.4
[From]: spec/application-structure.md, plan/application-architecture.md
"""
from todo.cli import TodoCLI

def main():
    TodoCLI().cmdloop()

if __name__ == "__main__":
    main()
```

### Step 6: Testing Implementation
**File:** `tests/test_models.py`

```python
import pytest
from datetime import datetime
from src.todo.models import Task

class TestTaskModel:
    def test_task_creation(self):
        task = Task(id=1, title="Test task")
        assert task.id == 1
        assert task.title == "Test task"
        assert task.completed == False
        assert isinstance(task.created_at, datetime)
    
    def test_mark_complete(self):
        task = Task(id=1, title="Test task")
        task.mark_complete()
        assert task.completed == True
    
    def test_task_update(self):
        task = Task(id=1, title="Old title", description="Old description")
        task.update(title="New title", description="New description")
        assert task.title == "New title"
        assert task.description == "New description"
```

## Phase II Implementation: Full-Stack Web Application

### Step 1: Backend API Setup
**File:** `backend/main.py`

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional
import os

app = FastAPI(title="Todo API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# JWT Configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-secret-key")
ALGORITHM = "HS256"

# Database Models
class User(SQLModel, table=True):
    """
    User model for authentication.
    
    [Task]: 2.2
    [From]: spec/database-schema.md, plan/authentication-architecture.md
    """
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, nullable=False)
    name: str
    created_at: datetime = Field(default_factory=datetime.now)

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class Task(TaskBase, SQLModel, table=True):
    """
    Task model with user relationship.
    
    [Task]: 2.2
    [From]: spec/database-schema.md, plan/database-architecture.md
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class TaskRead(TaskBase):
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

def get_session():
    with Session(engine) as session:
        yield session

def verify_token(token: str = Depends(get_token)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return user_id
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def get_token():
    # This would be replaced with actual token extraction from request headers
    # Implementation depends on how Better Auth provides the JWT
    pass

# API Routes
@app.get("/api/{user_id}/tasks", response_model=List[TaskRead])
def get_tasks(
    user_id: str,
    session: Session = Depends(get_session),
    authenticated_user_id: str = Depends(verify_token)
):
    """
    Get all tasks for a user.
    
    [Task]: 2.5
    [From]: spec/rest-api.md, plan/api-architecture.md
    """
    # Ensure user can only access their own tasks
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these tasks"
        )
    
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    return tasks

@app.post("/api/{user_id}/tasks", response_model=TaskRead)
def create_task(
    user_id: str,
    task: TaskCreate,
    session: Session = Depends(get_session),
    authenticated_user_id: str = Depends(verify_token)
):
    """
    Create a new task for a user.
    
    [Task]: 2.5
    [From]: spec/rest-api.md, plan/api-architecture.md
    """
    # Ensure user can only create tasks for themselves
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user"
        )
    
    db_task = Task(user_id=user_id, **task.dict())
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.get("/api/{user_id}/tasks/{task_id}", response_model=TaskRead)
def get_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    authenticated_user_id: str = Depends(verify_token)
):
    """
    Get a specific task for a user.
    
    [Task]: 2.5
    [From]: spec/rest-api.md, plan/api-architecture.md
    """
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task

@app.put("/api/{user_id}/tasks/{task_id}", response_model=TaskRead)
def update_task(
    user_id: str,
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    authenticated_user_id: str = Depends(verify_token)
):
    """
    Update a specific task for a user.
    
    [Task]: 2.5
    [From]: spec/rest-api.md, plan/api-architecture.md
    """
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )
    
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db_task.updated_at = datetime.now()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/api/{user_id}/tasks/{task_id}")
def delete_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    authenticated_user_id: str = Depends(verify_token)
):
    """
    Delete a specific task for a user.
    
    [Task]: 2.5
    [From]: spec/rest-api.md, plan/api-architecture.md
    """
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )
    
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    session.delete(db_task)
    session.commit()
    return {"message": "Task deleted successfully"}

@app.patch("/api/{user_id}/tasks/{task_id}/complete")
def toggle_task_completion(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    authenticated_user_id: str = Depends(verify_token)
):
    """
    Toggle task completion status.
    
    [Task]: 2.5
    [From]: spec/rest-api.md, plan/api-architecture.md
    """
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this task"
        )
    
    db_task = session.get(Task, task_id)
    if not db_task or db_task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db_task.completed = not db_task.completed
    db_task.updated_at = datetime.now()
    session.add(db_task)
    session.commit()
    return {"completed": db_task.completed}
```

### Step 2: Frontend Setup
**File:** `frontend/package.json`

```json
{
  "name": "todo-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "better-auth": "^0.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

## Phase III Implementation: AI-Powered Todo Chatbot

### Step 1: MCP Server Implementation
**File:** `backend/mcp_server.py`

```python
import asyncio
from typing import Any, Dict, List, Optional
from mcp.server import Server
from mcp.types import Tool, ToolCall, TextContent
from sqlmodel import Session, select
from .models import Task, TaskCreate, TaskUpdate
from .database import engine
import json

# Initialize MCP Server
mcp_server = Server("todo-mcp-server")

@mcp_server.tools.list
def list_tools() -> List[Tool]:
    """
    List available MCP tools for todo operations.
    
    [Task]: 3.1
    [From]: spec/mcp-tools.md, plan/ai-integration.md
    """
    return [
        Tool(
            name="add_task",
            description="Create a new task",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description (optional)"}
                },
                "required": ["user_id", "title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="Retrieve tasks from the list",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "status": {"type": "string", "enum": ["all", "pending", "completed"], "default": "all"}
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as complete",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "task_id": {"type": "integer", "description": "Task ID"}
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Remove a task from the list",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "task_id": {"type": "integer", "description": "Task ID"}
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Modify task title or description",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "task_id": {"type": "integer", "description": "Task ID"},
                    "title": {"type": "string", "description": "New task title (optional)"},
                    "description": {"type": "string", "description": "New task description (optional)"}
                },
                "required": ["user_id", "task_id"]
            }
        )
    ]

@mcp_server.tools.call
async def call_tool(tool_name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """
    Execute MCP tool calls for todo operations.
    
    [Task]: 3.1
    [From]: spec/mcp-tools.md, plan/ai-integration.md
    """
    user_id = arguments.get("user_id")
    
    with Session(engine) as session:
        if tool_name == "add_task":
            title = arguments.get("title")
            description = arguments.get("description")
            
            task_create = TaskCreate(title=title, description=description)
            db_task = Task(user_id=user_id, **task_create.dict())
            session.add(db_task)
            session.commit()
            session.refresh(db_task)
            
            result = {
                "task_id": db_task.id,
                "status": "created",
                "title": db_task.title
            }
            
        elif tool_name == "list_tasks":
            status = arguments.get("status", "all")
            
            query = select(Task).where(Task.user_id == user_id)
            if status == "pending":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)
            
            tasks = session.exec(query).all()
            result = [
                {"id": task.id, "title": task.title, "completed": task.completed}
                for task in tasks
            ]
            
        elif tool_name == "complete_task":
            task_id = arguments.get("task_id")
            db_task = session.get(Task, task_id)
            
            if db_task and db_task.user_id == user_id:
                db_task.completed = True
                session.add(db_task)
                session.commit()
                
                result = {
                    "task_id": db_task.id,
                    "status": "completed",
                    "title": db_task.title
                }
            else:
                result = {"error": "Task not found or unauthorized"}
                
        elif tool_name == "delete_task":
            task_id = arguments.get("task_id")
            db_task = session.get(Task, task_id)
            
            if db_task and db_task.user_id == user_id:
                session.delete(db_task)
                session.commit()
                
                result = {
                    "task_id": task_id,
                    "status": "deleted",
                    "title": db_task.title
                }
            else:
                result = {"error": "Task not found or unauthorized"}
                
        elif tool_name == "update_task":
            task_id = arguments.get("task_id")
            db_task = session.get(Task, task_id)
            
            if db_task and db_task.user_id == user_id:
                update_data = {}
                if "title" in arguments and arguments["title"] is not None:
                    update_data["title"] = arguments["title"]
                if "description" in arguments and arguments["description"] is not None:
                    update_data["description"] = arguments["description"]
                
                for field, value in update_data.items():
                    setattr(db_task, field, value)
                
                session.add(db_task)
                session.commit()
                
                result = {
                    "task_id": db_task.id,
                    "status": "updated",
                    "title": db_task.title
                }
            else:
                result = {"error": "Task not found or unauthorized"}
        else:
            result = {"error": f"Unknown tool: {tool_name}"}
    
    return [TextContent(type="text", text=json.dumps(result))]

# Run the MCP server
async def run_mcp_server():
    """
    Run the MCP server for AI agent integration.
    
    [Task]: 3.1
    [From]: spec/mcp-tools.md, plan/ai-integration.md
    """
    async with mcp_server.serve_stdio():
        await asyncio.Future()  # Run forever
```

### Step 2: Chat Endpoint Implementation
**File:** `backend/api/chat.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from ..models import Task, Conversation, Message
from ..database import get_session
from openai import OpenAI
import os
import json
from datetime import datetime

router = APIRouter(prefix="/api", tags=["chat"])

class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    
    [Task]: 3.4
    [From]: spec/chat-endpoint.md, plan/chat-architecture.md
    """
    conversation_id: Optional[int] = None
    message: str

class ChatResponse(BaseModel):
    """
    Response model for chat endpoint.
    
    [Task]: 3.4
    [From]: spec/chat-endpoint.md, plan/chat-architecture.md
    """
    conversation_id: int
    response: str
    tool_calls: List[Dict[str, Any]]

@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    session: Session = Depends(get_session)
):
    """
    Stateless chat endpoint that persists conversation state to database.
    
    [Task]: 3.4
    [From]: spec/chat-endpoint.md, plan/chat-architecture.md
    """
    # Get or create conversation
    conversation = None
    if request.conversation_id:
        conversation = session.get(Conversation, request.conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
    
    # Store user message
    user_message = Message(
        user_id=user_id,
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    session.add(user_message)
    session.commit()
    
    # Fetch conversation history
    history_query = select(Message).where(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at)
    history = session.exec(history_query).all()
    
    # Prepare messages for OpenAI
    openai_messages = []
    for msg in history:
        openai_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Add the new user message
    openai_messages.append({
        "role": "user",
        "content": request.message
    })
    
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    try:
        # Create assistant with tools
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=openai_messages,
            tools=[
                {
                    "type": "function",
                    "function": {
                        "name": "add_task",
                        "description": "Create a new task",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_id": {"type": "string"},
                                "title": {"type": "string"},
                                "description": {"type": "string"}
                            },
                            "required": ["user_id", "title"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "list_tasks",
                        "description": "List tasks",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_id": {"type": "string"},
                                "status": {"type": "string", "enum": ["all", "pending", "completed"]}
                            },
                            "required": ["user_id"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "complete_task",
                        "description": "Complete a task",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_id": {"type": "string"},
                                "task_id": {"type": "integer"}
                            },
                            "required": ["user_id", "task_id"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "delete_task",
                        "description": "Delete a task",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_id": {"type": "string"},
                                "task_id": {"type": "integer"}
                            },
                            "required": ["user_id", "task_id"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "update_task",
                        "description": "Update a task",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_id": {"type": "string"},
                                "task_id": {"type": "integer"},
                                "title": {"type": "string"},
                                "description": {"type": "string"}
                            },
                            "required": ["user_id", "task_id"]
                        }
                    }
                }
            ],
            tool_choice="auto"
        )
        
        # Process the response
        choice = response.choices[0]
        message = choice.message
        
        # Store assistant response
        assistant_message = Message(
            user_id=user_id,
            conversation_id=conversation.id,
            role="assistant",
            content=message.content or ""
        )
        session.add(assistant_message)
        session.commit()
        
        # Process tool calls if any
        tool_calls = []
        if message.tool_calls:
            for tool_call in message.tool_calls:
                tool_calls.append({
                    "id": tool_call.id,
                    "type": tool_call.type,
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments
                    }
                })
        
        return ChatResponse(
            conversation_id=conversation.id,
            response=message.content or "",
            tool_calls=tool_calls
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
```

## Phase IV Implementation: Local Kubernetes Deployment

### Step 1: Dockerfile Creation
**File:** `Dockerfile`

```dockerfile
# Multi-stage build for optimized image
FROM python:3.13-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY pyproject.toml poetry.lock* ./
RUN pip install poetry && \
    poetry export -o requirements.txt -f requirements.txt --without-hashes && \
    pip install -r requirements.txt

# Production stage
FROM base AS production

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Helm Chart Implementation
**File:** `charts/todo-app/Chart.yaml`

```yaml
apiVersion: v2
name: todo-app
description: A Helm chart for the Todo application
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```

**File:** `charts/todo-app/values.yaml`

```yaml
# Default values for todo-app
replicaCount: 1

image:
  repository: todo-app
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []

resources: {}
  # We usually recommend not to specify default resources and to leave this as a conscious
  # choice for the user. This also increases chances charts run on environments with little
  # resources, such as Minikube. If you do want to specify resources, uncomment the following
  # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
  # limits:
  #   cpu: 100m
  #   memory: 128Mi
  # requests:
  #   cpu: 100m
  #   memory: 128Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}

# PostgreSQL configuration
postgresql:
  enabled: true
  auth:
    postgresPassword: "todo-postgres-password"
    database: "todo_db"
  primary:
    persistence:
      enabled: false
```

## Phase V Implementation: Advanced Cloud Deployment

### Step 1: Kafka Integration
**File:** `backend/kafka/producer.py`

```python
from kafka import KafkaProducer
import json
from typing import Dict, Any
from datetime import datetime
import os

class TaskEventProducer:
    """
    Kafka producer for task events.
    
    [Task]: 5.1
    [From]: spec/kafka-integration.md, plan/event-architecture.md
    """
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',
            retries=3
        )
        
        # Define topics
        self.task_events_topic = 'task-events'
        self.reminders_topic = 'reminders'
        self.task_updates_topic = 'task-updates'
    
    def publish_task_event(self, event_type: str, task_data: Dict[str, Any], user_id: str):
        """
        Publish a task event to Kafka.
        """
        event = {
            'event_type': event_type,
            'task_id': task_data.get('id'),
            'task_data': task_data,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }
        
        self.producer.send(self.task_events_topic, event)
        self.producer.flush()
    
    def publish_reminder_event(self, task_id: int, title: str, due_at: str, remind_at: str, user_id: str):
        """
        Publish a reminder event to Kafka.
        """
        event = {
            'task_id': task_id,
            'title': title,
            'due_at': due_at,
            'remind_at': remind_at,
            'user_id': user_id
        }
        
        self.producer.send(self.reminders_topic, event)
        self.producer.flush()
    
    def publish_task_update(self, task_id: int, action: str, user_id: str):
        """
        Publish a task update event to Kafka.
        """
        event = {
            'task_id': task_id,
            'action': action,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }
        
        self.producer.send(self.task_updates_topic, event)
        self.producer.flush()
```

### Step 2: Dapr Integration
**File:** `dapr-components/pubsub.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka:9092"
    - name: consumerGroup
      value: "todo-service"
    - name: authRequired
      value: "false"
```

**File:** `dapr-components/statestore.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: "localhost:6379"
    - name: redisPassword
      value: ""
    - name: actorStateStore
      value: "true"
```

## Implementation Best Practices

### 1. Code Organization
- Follow the specified directory structure
- Use consistent naming conventions
- Separate concerns with clear module boundaries
- Document all public interfaces

### 2. Error Handling
- Implement comprehensive error handling
- Use appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging

### 3. Security Measures
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Protect against common vulnerabilities

### 4. Performance Optimization
- Use connection pooling
- Implement caching where appropriate
- Optimize database queries
- Monitor resource usage

### 5. Testing Strategy
- Write unit tests for all functions
- Implement integration tests
- Use property-based testing for complex logic
- Maintain high test coverage

## Deployment Implementation

### Local Development Setup
```bash
# Start the application locally
cd backend
uvicorn main:app --reload

# Run tests
cd backend
python -m pytest

# Start the frontend
cd frontend
npm run dev
```

### Kubernetes Deployment
```bash
# Build Docker images
docker build -t todo-app:latest .

# Start Minikube
minikube start

# Install Dapr
dapr init -k

# Deploy with Helm
helm install todo-app ./charts/todo-app

# Check deployment
kubectl get pods
dapr status
```

### Production Deployment
```bash
# Deploy to cloud Kubernetes
helm install todo-app ./charts/todo-app \
  --set image.repository=your-registry/todo-app \
  --set image.tag=latest \
  --set service.type=LoadBalancer
```

## Quality Assurance

### Code Review Checklist
- [ ] All code follows established patterns
- [ ] Security measures implemented
- [ ] Proper error handling in place
- [ ] Documentation is complete
- [ ] Tests cover all functionality
- [ ] Performance considerations addressed

### Testing Checklist
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end tests pass
- [ ] Security tests pass
- [ ] Performance tests pass
- [ ] Load tests pass

### Deployment Checklist
- [ ] Configuration is environment-specific
- [ ] Secrets are properly managed
- [ ] Monitoring is configured
- [ ] Backup procedures are in place
- [ ] Rollback procedures are tested
- [ ] Security scanning passed