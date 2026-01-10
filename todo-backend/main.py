from fastapi import FastAPI, HTTPException, Security, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any, Callable
import os
import traceback
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, select
import uuid
import asyncio
import secrets

from src.core.security import get_current_user_id
from src.models.models import Task, TaskUpdate
from src.db.session import engine, get_session
from src.api.tasks import router as tasks_router
from src.api.chat import router as chat_router
from src.api.reminders import router as reminders_router
from src.api.notifications import router as notifications_router
from src.api.websocket import websocket_endpoint
from src.core.settings import settings
from src.services.date_time_parser import date_time_parser_service

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from dotenv import load_dotenv
from sqlalchemy import text
from production_migration import run_migrations

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

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"GLOBAL ERROR CAUGHT: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    print(f"DEBUG: Backend starting up with DATABASE_URL: {settings.database_url}")
    try:
        # 1. Create tables if they don't exist
        SQLModel.metadata.create_all(engine)
        
        # 2. Run migrations to ensure all columns exist (important for production)
        run_migrations()
    except Exception as e:
        print(f"Error creating database tables or running migrations: {e}")

# --- Task Manager and Storage ---

class DatabaseStorage:
    """Handles persistent storage of tasks using the database engine."""

    def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: Optional[datetime] = None, parent_id: Optional[int] = None, attachments: str = "[]") -> Task:
        """Add a new task to storage for a specific user."""
        with Session(engine) as session:
            # Ensure user exists to avoid foreign key error
            user_check = session.execute(text("SELECT id FROM user WHERE id = :user_id"), {"user_id": user_id}).first()
            if not user_check:
                session.execute(
                    text("INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (:id, :name, :email, :emailVerified, :createdAt, :updatedAt)"),
                    {
                        "id": user_id, 
                        "name": user_id,
                        "email": f"user_{user_id}@example.com", 
                        "emailVerified": False,
                        "createdAt": datetime.now(),
                        "updatedAt": datetime.now()
                    }
                )
            
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
        
        expires_at = request.expires_at
        if expires_at is None:
            expires_at = datetime.now() + timedelta(days=request.expires_in or 7)
            
        token_to_store = request.token
        if "." in token_to_store and len(token_to_store.split(".")) >= 2:
            token_to_store = token_to_store.split(".")[0]

        with DBSession(engine) as session:
            # Ensure the user exists in the user table
            user_check = session.execute(text("SELECT id FROM user WHERE id = :user_id"), {"user_id": request.user_id}).first()
            if not user_check:
                session.execute(
                    text("INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (:id, :name, :email, :emailVerified, :createdAt, :updatedAt)"),
                    {
                        "id": request.user_id, 
                        "name": request.user_id,
                        "email": f"user_{request.user_id}@example.com", 
                        "emailVerified": False,
                        "createdAt": datetime.now(),
                        "updatedAt": datetime.now()
                    }
                )

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
if not gemini_api_key:
    print("Warning: GEMINI_API_KEY not found in environment.")
    gemini_api_key = "dummy-key-for-development"

external_client = AsyncOpenAI(
    api_key=gemini_api_key,
    timeout=30.0,
    base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
)

model = OpenAIChatCompletionsModel(
    openai_client=external_client,
    model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
)

config = RunConfig(
    model=model,
    model_provider=external_client,
    tracing_disabled=True,
)

chat_sessions: Dict[str, List[Any]] = {}  # session_id -> messages
user_sessions: Dict[str, List[str]] = {}  # user_id -> [session_ids]

class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str  # 'user' or 'ai'
    timestamp: datetime
    session_id: str

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

@app.get("/health")
async def health_check():
    """Enhanced health check with database connection check"""
    try:
        from sqlalchemy import text
        with Session(engine) as session:
            session.execute(text("SELECT 1"))
        db_status = "connected"
        db_dialect = engine.dialect.name
        return {
            "status": "healthy",
            "database": db_status,
            "database_type": db_dialect,
            "ai_service": "operational" if gemini_api_key and gemini_api_key != "dummy-key-for-development" else "limited",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/api/chat/ask-ai")
async def ask_ai_help(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
    try:
        print(f"DEBUG: ask_ai_help triggered by user {current_user_id}, message: {request.message}")
        def add_task(title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: str = "", parent_id: int = None, attachments: str = "[]") -> str:
            """
            Adds a new task to the user's todo list.
            """
            try:
                parsed_due_date = None
                if due_date:
                    parsed_due_date = date_time_parser_service.parse_datetime(due_date)
                
                task = task_manager.add_task(current_user_id, title, description, priority, category, parsed_due_date, parent_id, attachments)
                return f"Successfully added task: '{task.title}' (ID: {task.id}) with Due Date: {task.due_date}"
            except Exception as e:
                print(f"ERROR in add_task tool: {str(e)}")
                return f"Error adding task: {str(e)}"
        
        add_task.name = "add_task"

        help_response = await generate_ai_help_response(request.message, tools=[add_task])
        session_id = request.session_id or str(uuid.uuid4())

        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
            if current_user_id not in user_sessions:
                user_sessions[current_user_id] = []
            user_sessions[current_user_id].append(session_id)

        ai_message = ChatMessage(id=str(uuid.uuid4()), content=help_response, sender="ai", timestamp=datetime.now(), session_id=session_id)
        chat_sessions[session_id].append(ai_message)

        return ChatResponse(message=ai_message, session_id=session_id)
    except Exception as e:
        print(f"CRITICAL ERROR in ask_ai_help: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

async def generate_ai_help_response(message: str, tools: List[Callable] = []) -> str:
    try:
        instructions = (
            "You are an intelligent task assistant for DoQuanta. Your goal is to help the user manage their tasks efficiently.\n"
            "When the user wants to add a task:\n"
            "1. Ensure you have a clear 'Title'.\n"
            "2. If 'Due Date', 'Priority', or 'Category' are missing, check the context. If you can infer them, do so.\n"
            "3. If critical information is missing or ambiguous, ASK the user for clarification before adding the task.\n"
            "4. Example: If user says 'meeting tomorrow', infer due_date='tomorrow'. If user says 'buy milk', ask 'When do you need this done?' or set a default if they seem casual.\n"
            "5. You can also handle 'subtasks' (by adding multiple tasks or linking them if parent_id is available) and 'attachments' (urls).\n"
            "6. Always confirm what you did."
        )
        agent = Agent(name="Help Assistant", instructions=instructions, model=model, tools=tools)
        # Use asyncio.wait_for to prevent hanging
        result = await asyncio.wait_for(Runner.run(agent, message, run_config=config), timeout=25.0)
        return result.final_output
    except asyncio.TimeoutError:
        print("AI Help Error: Request timed out")
        return "📚 **Help with: AI Service**\n\nThe request timed out. The AI model is currently slow or unavailable. Please try a simpler request or wait a moment."
    except Exception as e:
        print(f"AI Help Error: {e}")
        traceback.print_exc()
        return f"📚 **Help with: {message}**\n\nI encountered an error while processing your request: {str(e)}. Please try again later."

# Include API routers (Tasks, Chat, Reminders, Notifications)
app.include_router(tasks_router)
app.include_router(chat_router)
app.include_router(reminders_router)
app.include_router(notifications_router)

# WebSocket endpoint for real-time chat
app.websocket("/ws/{user_id}")(websocket_endpoint)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
