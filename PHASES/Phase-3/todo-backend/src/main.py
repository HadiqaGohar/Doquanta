from fastapi import FastAPI, HTTPException, Security, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any, Callable
import os
import traceback
from datetime import datetime
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, select
import uuid
import asyncio

from .core.security import get_current_user_id
from .models.models import Task
from .db.session import engine, get_session
from .api.tasks import router as tasks_router
from .api.chat import router as chat_router
from .api.reminders import router as reminders_router
from .api.notifications import router as notifications_router
from .api.websocket import websocket_endpoint
from .core.settings import settings
from .services.date_time_parser import date_time_parser_service

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://doquanta.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    print(f"DEBUG: Backend starting up with DATABASE_URL: {settings.database_url}")
    try:
        # 1. Create tables if they don't exist
        SQLModel.metadata.create_all(engine)
        
        # 2. Run migrations to ensure all columns exist (important for production)
        from production_migration import run_migrations
        run_migrations()
    except Exception as e:
        print(f"Error creating database tables or running migrations: {e}")

# --- Task Manager and Storage ---

class DatabaseStorage:
    """Handles persistent storage of tasks using the database engine."""

    def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: Optional[datetime] = None, parent_id: Optional[int] = None, attachments: str = "[]") -> Task:
        """Add a new task to storage for a specific user."""
        with Session(engine) as session:
            db_task = Task(
                user_id=user_id,
                title=title,
                description=description,
                completed=False,
                priority=priority,
                category=category,
                due_date=due_date,
                parent_id=parent_id,
                attachments=attachments,
                created_at=datetime.now()
            )
            session.add(db_task)
            session.commit()
            session.refresh(db_task)
            return db_task

class TaskManager:
    """Handles all task operations and business logic."""

    def __init__(self):
        self.storage = DatabaseStorage()

    def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: Optional[datetime] = None, parent_id: Optional[int] = None, attachments: str = "[]") -> Task:
        """Add a new task for a specific user and return it."""
        if not title.strip():
            raise HTTPException(status_code=400, detail="Task title cannot be empty.")
        return self.storage.add_task(user_id, title, description, priority, category, due_date, parent_id, attachments)

# Initialize the task manager
task_manager = TaskManager()

# --- Session Management ---

class RegisterSessionRequest(BaseModel):
    user_id: str
    token: str
    expires_at: Optional[datetime] = None
    expires_in: Optional[int] = 7

@app.post("/api/register-session")
async def register_session(request: RegisterSessionRequest):
    """Register a session token from Better Auth with the backend."""
    try:
        from sqlmodel import Session as DBSession
        from datetime import datetime, timedelta
        import secrets
        from sqlalchemy import text

        expires_at = request.expires_at
        if expires_at is None:
            expires_at = datetime.now() + timedelta(days=request.expires_in or 7)
            
        token_to_store = request.token
        if "." in token_to_store and len(token_to_store.split(".")) >= 2:
            token_to_store = token_to_store.split(".")[0]

        with DBSession(engine) as session:
            is_postgres = "postgresql" in str(engine.url)
            
            if is_postgres:
                session_sql = """
                INSERT INTO \"session\" (\"id\", \"userId\", \"token\", \"expiresAt\", \"createdAt\", \"updatedAt\")
                VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at)
                ON CONFLICT (\"token\") DO UPDATE SET
                    \"userId\" = EXCLUDED.\"userId\",
                    \"expiresAt\" = EXCLUDED.\"expiresAt\",
                    \"updatedAt\" = EXCLUDED.\"updatedAt\";
                """
            else:
                session_sql = """
                INSERT OR REPLACE INTO session ("id", "userId", "token", "expiresAt", "createdAt", "updatedAt")
                VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at);
                """

            existing_session = None
            try:
                query = 'SELECT id FROM \"session\" WHERE token = :token' if is_postgres else 'SELECT id FROM session WHERE token = :token'
                existing_session = session.execute(text(query), {"token": token_to_store}).first()
            except Exception:
                pass
            
            session_id = existing_session[0] if existing_session else secrets.token_urlsafe(16)

            session.execute(text(session_sql), {
                "id": session_id,
                "user_id": request.user_id,
                "token": token_to_store,
                "expires_at": expires_at,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })
            session.commit()

        return {"message": "Session registered successfully", "user_id": request.user_id}
    except Exception as e:
        print(f"Error registering session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering session: {str(e)}")

# --- AI Models and Agents ---

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key or gemini_api_key == "dummy-key-for-development":
    gemini_api_key = os.getenv("GEMINI_API_KEY")

gemini_base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"

external_client = AsyncOpenAI(
    api_key=gemini_api_key,
    timeout=60.0,
    base_url=gemini_base_url,
)

model = OpenAIChatCompletionsModel(
    openai_client=external_client,
    model="gemini-3-flash-preview",
    # model="gemini-2.0-flash-lite"
)

config = RunConfig(
    model=model,
    model_provider=external_client,
    tracing_disabled=True,
)

class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str  # 'user' or 'ai'
    timestamp: datetime
    session_id: str

chat_sessions: Dict[str, List[ChatMessage]] = {}  # session_id -> messages
user_sessions: Dict[str, List[str]] = {}  # user_id -> [session_ids]

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: ChatMessage
    session_id: str

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Welcome to DoQuanta Todo Backend API"}

from .services.mcp_integration import MCPTodoService
import json

@app.post("/api/chat/ask-ai")
async def ask_ai_help(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize session if not exists
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
            if current_user_id not in user_sessions:
                user_sessions[current_user_id] = []
            user_sessions[current_user_id].append(session_id)
        
        # Security check: Ensure user owns this session
        if session_id in chat_sessions and session_id not in user_sessions.get(current_user_id, []):
            raise HTTPException(status_code=403, detail="Unauthorized session access")

        # Save user message to history
        user_msg = ChatMessage(id=str(uuid.uuid4()), content=request.message, sender="user", timestamp=datetime.now(), session_id=session_id)
        chat_sessions[session_id].append(user_msg)

        # Tools mapping
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                            "category": {"type": "string"},
                            "due_date": {"type": "string"},
                            "reminder_time": {"type": "string"}
                        },
                        "required": ["user_id", "title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List user tasks",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string"},
                            "status": {"type": "string", "enum": ["all", "active", "completed"]}
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
            }
        ]

        messages = [
            {
                "role": "system",
                "content": f"""
                You are an intelligent task assistant for DoQuanta.
                Use user ID {current_user_id} for all tools.
                If you don't know a task_id, use list_tasks first.
                Be concise and professional.
                """
            },
            {
                "role": "user",
                "content": request.message
            }
        ]

        # Call AI
        response = await external_client.chat.completions.create(
            model="gemini-3-flash-preview",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        message = response.choices[0].message
        response_content = message.content or "Processing..."

        if message.tool_calls:
            messages.append(message)
            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                if "user_id" not in arguments:
                    arguments["user_id"] = current_user_id
                
                try:
                    tool_result = await MCPTodoService.execute_tool(tool_name, arguments)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": json.dumps(tool_result)
                    })
                except Exception as e:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": json.dumps({"error": str(e)})
                    })

            final_response = await external_client.chat.completions.create(
                model="gemini-3-flash-preview",
                messages=messages
            )
            response_content = final_response.choices[0].message.content or "Completed."

        # Save AI response to history
        ai_msg = ChatMessage(id=str(uuid.uuid4()), content=response_content, sender="ai", timestamp=datetime.now(), session_id=session_id)
        chat_sessions[session_id].append(ai_msg)

        return ChatResponse(message=ai_msg, session_id=session_id)
    except Exception as e:
        print(f"CRITICAL ERROR in ask_ai_help: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

async def generate_ai_help_response(message: str, instructions: str = "") -> str:
    try:
        agent = Agent(name="Help Assistant", instructions=instructions, model=model)
        result = await asyncio.wait_for(Runner.run(agent, message, run_config=config), timeout=40.0)
        return result.final_output
    except Exception as e:
        print(f"AI Help Error: {e}")
        return f"Sorry, I encountered an error: {str(e)}"

# Include routers
app.include_router(tasks_router)
app.include_router(chat_router)
app.include_router(reminders_router)
app.include_router(notifications_router)

# WebSocket
app.websocket("/ws/{user_id}")(websocket_endpoint)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=False)
