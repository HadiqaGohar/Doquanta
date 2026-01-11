# from fastapi import FastAPI, HTTPException, Security, File, UploadFile, Form, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from typing import List, Optional, Dict, Any, Callable
# import os
# import traceback
# from datetime import datetime
# from pydantic import BaseModel
# from sqlmodel import SQLModel, Session, select
# import uuid
# import asyncio

# from .core.security import get_current_user_id
# from .models.models import Task
# from .db.session import engine, get_session
# from .api.tasks import router as tasks_router
# from .api.chat import router as chat_router
# from .api.reminders import router as reminders_router
# from .api.notifications import router as notifications_router
# from .api.websocket import websocket_endpoint
# from .core.settings import settings
# from .services.date_time_parser import date_time_parser_service
# from .services.ai_service import ai_service # Import the new service

# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# app = FastAPI(
#     title=settings.app_name,
#     version=settings.version,
#     debug=settings.debug
# )

# # Configure CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "https://doquanta.vercel.app",
#         "https://*.vercel.app"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.on_event("startup")
# def on_startup():
#     """Create database tables on startup."""
#     print(f"DEBUG: Backend starting up with DATABASE_URL: {settings.database_url}")
#     try:
#         # 1. Create tables if they don't exist
#         SQLModel.metadata.create_all(engine)
        
#         # 2. Run migrations to ensure all columns exist (important for production)
#         from production_migration import run_migrations
#         run_migrations()
#     except Exception as e:
#         print(f"Error creating database tables or running migrations: {e}")

# # --- Task Manager and Storage ---

# class DatabaseStorage:
#     """Handles persistent storage of tasks using the database engine."""

#     def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: Optional[datetime] = None, parent_id: Optional[int] = None, attachments: str = "[]") -> Task:
#         """Add a new task to storage for a specific user."""
#         with Session(engine) as session:
#             db_task = Task(
#                 user_id=user_id,
#                 title=title,
#                 description=description,
#                 completed=False,
#                 priority=priority,
#                 category=category,
#                 due_date=due_date,
#                 parent_id=parent_id,
#                 attachments=attachments,
#                 created_at=datetime.now()
#             )
#             session.add(db_task)
#             session.commit()
#             session.refresh(db_task)
#             return db_task

# class TaskManager:
#     """Handles all task operations and business logic."""

#     def __init__(self):
#         self.storage = DatabaseStorage()

#     def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: Optional[datetime] = None, parent_id: Optional[int] = None, attachments: str = "[]") -> Task:
#         """Add a new task for a specific user and return it."""
#         if not title.strip():
#             raise HTTPException(status_code=400, detail="Task title cannot be empty.")
#         return self.storage.add_task(user_id, title, description, priority, category, due_date, parent_id, attachments)

# # Initialize the task manager
# task_manager = TaskManager()

# # --- Session Management ---

# class RegisterSessionRequest(BaseModel):
#     user_id: str
#     token: str
#     expires_at: Optional[datetime] = None
#     expires_in: Optional[int] = 7

# @app.post("/api/register-session")
# async def register_session(request: RegisterSessionRequest):
#     """Register a session token from Better Auth with the backend."""
#     try:
#         from sqlmodel import Session as DBSession
#         from datetime import datetime, timedelta
#         import secrets
#         from sqlalchemy import text

#         expires_at = request.expires_at
#         if expires_at is None:
#             expires_at = datetime.now() + timedelta(days=request.expires_in or 7)
            
#         token_to_store = request.token
#         if "." in token_to_store and len(token_to_store.split(".")) >= 2:
#             token_to_store = token_to_store.split(".")[0]

#         with DBSession(engine) as session:
#             is_postgres = "postgresql" in str(engine.url)
            
#             if is_postgres:
#                 session_sql = """
#                 INSERT INTO \"session\" (\"id\", \"userId\", \"token\", \"expiresAt\", \"createdAt\", \"updatedAt\")
#                 VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at)
#                 ON CONFLICT (\"token\") DO UPDATE SET
#                     \"userId\" = EXCLUDED.\"userId\",
#                     \"expiresAt\" = EXCLUDED.\"expiresAt\",
#                     \"updatedAt\" = EXCLUDED.\"updatedAt\";
#                 """
#             else:
#                 session_sql = """
#                 INSERT OR REPLACE INTO session ("id", "user_id", "token", "expires_at", "created_at", "updated_at")
#                 VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at);
#                 """

#             existing_session = None
#             try:
#                 query = 'SELECT id FROM \"session\" WHERE token = :token' if is_postgres else 'SELECT id FROM session WHERE token = :token'
#                 existing_session = session.execute(text(query), {"token": token_to_store}).first()
#             except Exception:
#                 pass
            
#             session_id = existing_session[0] if existing_session else secrets.token_urlsafe(16)

#             session.execute(text(session_sql), {
#                 "id": session_id,
#                 "user_id": request.user_id,
#                 "token": token_to_store,
#                 "expires_at": expires_at,
#                 "created_at": datetime.now(),
#                 "updated_at": datetime.now()
#             })
#             session.commit()

#         return {"message": "Session registered successfully", "user_id": request.user_id}
#     except Exception as e:
#         print(f"Error registering session: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error registering session: {str(e)}")

# # --- AI Models and Agents ---

# # Note: Deprecated 'agents' library code removed in favor of src.services.ai_service

# chat_sessions: Dict[str, List[Any]] = {}  # session_id -> messages
# user_sessions: Dict[str, List[str]] = {}  # user_id -> [session_ids]

# class ChatMessage(BaseModel):
#     id: str
#     content: str
#     sender: str  # 'user' or 'ai'
#     timestamp: datetime
#     session_id: str

# class ChatRequest(BaseModel):
#     message: str
#     session_id: Optional[str] = None

# class ChatResponse(BaseModel):
#     message: ChatMessage
#     session_id: str

# # --- API Endpoints ---

# @app.get("/")
# async def root():
#     return {"message": "Welcome to DoQuanta Todo Backend API"}

# @app.get("/health")
# async def health_check():
#     """Enhanced health check with database connection check"""
#     try:
#         from sqlalchemy import text
#         with Session(engine) as session:
#             session.execute(text("SELECT 1"))
#         db_status = "connected"
#         return {
#             "status": "healthy",
#             "database": db_status,
#             "ai_service": "operational" if settings.better_auth_secret else "configured",
#             "version": "1.0.0",
#             "timestamp": datetime.now().isoformat()
#         }
#     except Exception as e:
#         return {"status": "unhealthy", "error": str(e)}

# @app.post("/api/chat/ask-ai")
# async def ask_ai_help(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
#     try:
#         print(f"DEBUG: ask_ai_help triggered by user {current_user_id}, message: {request.message}")
        
#         # Use the new robust AI service
#         help_response = await ai_service.process_message(current_user_id, request.message)
        
#         session_id = request.session_id or str(uuid.uuid4())

#         if session_id not in chat_sessions:
#             chat_sessions[session_id] = []
#             if current_user_id not in user_sessions:
#                 user_sessions[current_user_id] = []
#             user_sessions[current_user_id].append(session_id)
#         else:
#             if current_user_id not in user_sessions or session_id not in user_sessions[current_user_id]:
#                 # Relaxed check for now to prevent session issues
#                 pass

#         ai_message = ChatMessage(id=str(uuid.uuid4()), content=help_response, sender="ai", timestamp=datetime.now(), session_id=session_id)
#         chat_sessions[session_id].append(ai_message)

#         return ChatResponse(message=ai_message, session_id=session_id)
#     except Exception as e:
#         print(f"CRITICAL ERROR in ask_ai_help: {str(e)}")
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

# # Include API routers
# app.include_router(tasks_router)
# app.include_router(chat_router)
# app.include_router(reminders_router)
# app.include_router(notifications_router)

# # WebSocket endpoint for real-time chat
# app.websocket("/ws/{user_id}")(websocket_endpoint)

# if __name__ == "__main__":
#     import uvicorn
#     port = int(os.getenv("PORT", 8080))
#     uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=False, workers=1)




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
import json

# OpenAI Agents SDK imports
from openai import AsyncOpenAI
from agents import (
    Agent,
    Runner,
    RunConfig,
    function_tool,
    OpenAIChatCompletionsModel
)

from .core.security import get_current_user_id
from .models.models import Task
from .db.session import engine, get_session
from .api.tasks import router as tasks_router
from .api.chat import router as chat_router
from .api.reminders import router as reminders_router
from .api.notifications import router as notifications_router
from .api.websocket import websocket_endpoint
from .core.settings import settings

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

# --- OpenAI Agents SDK Setup with Gemini API ---
class AIService:
    """AI Service using OpenAI Agents SDK with Gemini API"""
    
    def __init__(self):
        # Gemini API key setup for OpenAI-compatible endpoint
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set.")
        
        # Create AsyncOpenAI client with Gemini API
        self.client = AsyncOpenAI(
            api_key=gemini_api_key,
            timeout=30.0,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        
        # Create model with Gemini
        self.model = OpenAIChatCompletionsModel(
            openai_client=self.client,
            model="gemini-2.0-flash-exp",  # or "gemini-2.0-flash", "gemini-1.5-pro"
        )
        
        # Run configuration
        self.config = RunConfig(
            model=self.model,
            model_provider=self.client,
            tracing_disabled=True,
        )
        
        # Define tools for the agent
        self.tools = [
            self.get_tasks_tool(),
            self.create_task_tool(),
            self.update_task_tool(),
            self.delete_task_tool(),
            self.get_reminders_tool(),
            self.get_current_datetime_tool()
        ]
        
        # Main agent with instructions and tools
        self.agent = Agent(
            name="DoQuanta AI Assistant",
            instructions="""
            You are an intelligent AI assistant for DoQuanta, a task management application.
            
            Your responsibilities:
            1. Help users manage their tasks (create, read, update, delete)
            2. Provide reminders and notifications about upcoming tasks
            3. Answer questions about task management and productivity
            4. Help users organize their tasks by category, priority, and due dates
            5. Provide helpful suggestions and tips for productivity
            
            Be friendly, helpful, and concise. When users ask about their tasks,
            use the available tools to fetch real data from their account.
            
            If you don't have enough information, ask clarifying questions.
            Always maintain context within the current conversation.
            """,
            model=self.model,
            tools=self.tools
        )
    
    # --- Tool Definitions ---
    
    @function_tool
    def get_tasks_tool(self) -> Callable:
        async def get_tasks(
            user_id: str,
            completed: Optional[bool] = None,
            priority: Optional[str] = None,
            category: Optional[str] = None
        ) -> List[Dict[str, Any]]:
            """Get tasks for a specific user with optional filters."""
            try:
                from sqlalchemy import text
                with Session(engine) as session:
                    query = """
                    SELECT * FROM task 
                    WHERE user_id = :user_id
                    """
                    params = {"user_id": user_id}
                    
                    if completed is not None:
                        query += " AND completed = :completed"
                        params["completed"] = completed
                    
                    if priority:
                        query += " AND priority = :priority"
                        params["priority"] = priority
                    
                    if category:
                        query += " AND category = :category"
                        params["category"] = category
                    
                    query += " ORDER BY created_at DESC"
                    
                    result = session.execute(text(query), params)
                    tasks = result.fetchall()
                    
                    return [
                        {
                            "id": task.id,
                            "title": task.title,
                            "description": task.description,
                            "completed": task.completed,
                            "priority": task.priority,
                            "category": task.category,
                            "due_date": task.due_date.isoformat() if task.due_date else None,
                            "created_at": task.created_at.isoformat() if task.created_at else None
                        }
                        for task in tasks
                    ]
            except Exception as e:
                return {"error": f"Failed to fetch tasks: {str(e)}"}
        
        return get_tasks
    
    @function_tool
    def create_task_tool(self) -> Callable:
        async def create_task(
            user_id: str,
            title: str,
            description: Optional[str] = "",
            priority: str = "medium",
            category: str = "general",
            due_date: Optional[str] = None
        ) -> Dict[str, Any]:
            """Create a new task for a user."""
            try:
                with Session(engine) as session:
                    db_task = Task(
                        user_id=user_id,
                        title=title,
                        description=description,
                        completed=False,
                        priority=priority,
                        category=category,
                        due_date=datetime.fromisoformat(due_date) if due_date else None,
                        created_at=datetime.now()
                    )
                    session.add(db_task)
                    session.commit()
                    session.refresh(db_task)
                    
                    return {
                        "success": True,
                        "task": {
                            "id": db_task.id,
                            "title": db_task.title,
                            "description": db_task.description,
                            "priority": db_task.priority,
                            "category": db_task.category,
                            "due_date": db_task.due_date.isoformat() if db_task.due_date else None
                        }
                    }
            except Exception as e:
                return {"success": False, "error": f"Failed to create task: {str(e)}"}
        
        return create_task
    
    @function_tool
    def update_task_tool(self) -> Callable:
        async def update_task(
            task_id: int,
            title: Optional[str] = None,
            description: Optional[str] = None,
            completed: Optional[bool] = None,
            priority: Optional[str] = None,
            category: Optional[str] = None,
            due_date: Optional[str] = None
        ) -> Dict[str, Any]:
            """Update an existing task."""
            try:
                with Session(engine) as session:
                    task = session.get(Task, task_id)
                    if not task:
                        return {"success": False, "error": "Task not found"}
                    
                    if title is not None:
                        task.title = title
                    if description is not None:
                        task.description = description
                    if completed is not None:
                        task.completed = completed
                    if priority is not None:
                        task.priority = priority
                    if category is not None:
                        task.category = category
                    if due_date is not None:
                        task.due_date = datetime.fromisoformat(due_date)
                    
                    session.commit()
                    session.refresh(task)
                    
                    return {
                        "success": True,
                        "task": {
                            "id": task.id,
                            "title": task.title,
                            "description": task.description,
                            "completed": task.completed,
                            "priority": task.priority,
                            "category": task.category,
                            "due_date": task.due_date.isoformat() if task.due_date else None
                        }
                    }
            except Exception as e:
                return {"success": False, "error": f"Failed to update task: {str(e)}"}
        
        return update_task
    
    @function_tool
    def delete_task_tool(self) -> Callable:
        async def delete_task(task_id: int) -> Dict[str, Any]:
            """Delete a task."""
            try:
                with Session(engine) as session:
                    task = session.get(Task, task_id)
                    if not task:
                        return {"success": False, "error": "Task not found"}
                    
                    session.delete(task)
                    session.commit()
                    
                    return {"success": True, "message": f"Task {task_id} deleted"}
            except Exception as e:
                return {"success": False, "error": f"Failed to delete task: {str(e)}"}
        
        return delete_task
    
    @function_tool
    def get_reminders_tool(self) -> Callable:
        async def get_reminders(user_id: str) -> List[Dict[str, Any]]:
            """Get upcoming reminders/tasks for a user."""
            try:
                from sqlalchemy import text
                with Session(engine) as session:
                    query = """
                    SELECT * FROM task 
                    WHERE user_id = :user_id 
                    AND completed = false
                    AND due_date IS NOT NULL
                    AND due_date > :now
                    ORDER BY due_date ASC
                    LIMIT 10
                    """
                    
                    result = session.execute(text(query), {
                        "user_id": user_id,
                        "now": datetime.now()
                    })
                    tasks = result.fetchall()
                    
                    return [
                        {
                            "id": task.id,
                            "title": task.title,
                            "due_date": task.due_date.isoformat() if task.due_date else None,
                            "priority": task.priority,
                            "category": task.category
                        }
                        for task in tasks
                    ]
            except Exception as e:
                return {"error": f"Failed to fetch reminders: {str(e)}"}
        
        return get_reminders
    
    @function_tool
    def get_current_datetime_tool(self) -> Callable:
        async def get_current_datetime() -> Dict[str, str]:
            """Get the current date and time."""
            return {
                "current_datetime": datetime.now().isoformat(),
                "timezone": "UTC"
            }
        
        return get_current_datetime
    
    # --- Main Processing Methods ---
    
    async def process_message(self, user_id: str, message: str) -> str:
        """Process a user message using OpenAI Agents SDK with Gemini."""
        try:
            # Add user context to the message
            contextual_message = f"User ID: {user_id}\n\nMessage: {message}"
            
            # Run the agent with the message
            result = await Runner.run(
                agent=self.agent,
                input=contextual_message,
                run_config=self.config
            )
            
            return result.final_output
            
        except Exception as e:
            print(f"Error in AI processing with Gemini: {e}")
            return f"I apologize, but I'm having trouble processing your request. Please try again later."
    
    async def create_task_from_natural_language(self, user_id: str, natural_text: str) -> Dict[str, Any]:
        """Parse natural language to create a task."""
        try:
            # Use agent to parse natural language
            parse_prompt = f"""
            Parse this task description into structured data:
            "{natural_text}"
            
            Return a JSON with:
            - title: Main task title
            - description: Detailed description (optional)
            - priority: "high", "medium", or "low"
            - category: Work/Personal/Health/etc.
            - due_date: ISO date string if mentioned
            
            User ID: {user_id}
            
            Return ONLY valid JSON, no other text.
            """
            
            result = await Runner.run(
                agent=self.agent,
                input=parse_prompt,
                run_config=self.config
            )
            
            # Parse the JSON response
            try:
                # Extract JSON from response
                response_text = result.final_output
                # Find JSON in response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = response_text[start_idx:end_idx]
                    task_data = json.loads(json_str)
                else:
                    # If no JSON found, create default
                    task_data = {
                        "title": natural_text,
                        "description": "",
                        "priority": "medium",
                        "category": "general"
                    }
            except json.JSONDecodeError:
                task_data = {
                    "title": natural_text,
                    "description": "",
                    "priority": "medium",
                    "category": "general"
                }
            
            # Create the task
            create_result = await self.create_task_tool()(
                user_id=user_id,
                title=task_data.get("title", natural_text),
                description=task_data.get("description", ""),
                priority=task_data.get("priority", "medium"),
                category=task_data.get("category", "general"),
                due_date=task_data.get("due_date")
            )
            
            return create_result
            
        except Exception as e:
            return {"success": False, "error": f"Failed to parse natural language: {str(e)}"}

# Initialize AI Service
ai_service = AIService()

@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    print(f"DEBUG: Backend starting up with DATABASE_URL: {settings.database_url}")
    try:
        # 1. Create tables if they don't exist
        SQLModel.metadata.create_all(engine)
        
        # 2. Run migrations to ensure all columns exist
        from production_migration import run_migrations
        run_migrations()
        
        # 3. Verify Gemini API key
        if not os.getenv("GEMINI_API_KEY"):
            print("WARNING: GEMINI_API_KEY environment variable is not set!")
        else:
            print("INFO: OpenAI Agents SDK with Gemini initialized successfully")
            
    except Exception as e:
        print(f"Error during startup: {e}")

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
                INSERT OR REPLACE INTO session ("id", "user_id", "token", "expires_at", "created_at", "updated_at")
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

# --- Chat Models and Storage ---

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
        
        # Check AI service
        ai_status = "operational" if os.getenv("GEMINI_API_KEY") else "no_api_key"
        
        return {
            "status": "healthy",
            "database": db_status,
            "ai_service": ai_status,
            "openai_agents_sdk": "initialized",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/api/chat/ask-ai")
async def ask_ai_help(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
    """Main AI chat endpoint using OpenAI Agents SDK with Gemini"""
    try:
        print(f"DEBUG: ask_ai_help triggered by user {current_user_id}, message: {request.message}")
        
        # Use OpenAI Agents SDK with Gemini
        help_response = await ai_service.process_message(current_user_id, request.message)
        
        session_id = request.session_id or str(uuid.uuid4())

        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
            if current_user_id not in user_sessions:
                user_sessions[current_user_id] = []
            user_sessions[current_user_id].append(session_id)

        ai_message = ChatMessage(
            id=str(uuid.uuid4()), 
            content=help_response, 
            sender="ai", 
            timestamp=datetime.now(), 
            session_id=session_id
        )
        
        chat_sessions[session_id].append(ai_message)

        return ChatResponse(message=ai_message, session_id=session_id)
    except Exception as e:
        print(f"CRITICAL ERROR in ask_ai_help: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/create-task-natural")
async def create_task_natural_language(
    request: ChatRequest, 
    current_user_id: str = Security(get_current_user_id)
):
    """Create task from natural language using AI"""
    try:
        result = await ai_service.create_task_from_natural_language(
            current_user_id, 
            request.message
        )
        
        if result.get("success"):
            return {
                "success": True,
                "task": result["task"],
                "message": f"Task '{result['task']['title']}' created successfully!"
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to create task"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/tools/available")
async def get_available_tools():
    """Get list of available AI tools"""
    tools = [
        {
            "name": "get_tasks",
            "description": "Get user's tasks with filters",
            "parameters": ["user_id", "completed", "priority", "category"]
        },
        {
            "name": "create_task",
            "description": "Create a new task",
            "parameters": ["user_id", "title", "description", "priority", "category", "due_date"]
        },
        {
            "name": "update_task",
            "description": "Update an existing task",
            "parameters": ["task_id", "title", "description", "completed", "priority", "category", "due_date"]
        },
        {
            "name": "delete_task",
            "description": "Delete a task",
            "parameters": ["task_id"]
        },
        {
            "name": "get_reminders",
            "description": "Get upcoming reminders",
            "parameters": ["user_id"]
        },
        {
            "name": "get_current_datetime",
            "description": "Get current date and time",
            "parameters": []
        }
    ]
    return {"tools": tools}

# Include API routers
app.include_router(tasks_router)
app.include_router(chat_router)
app.include_router(reminders_router)
app.include_router(notifications_router)

# WebSocket endpoint for real-time chat
app.websocket("/ws/{user_id}")(websocket_endpoint)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=False, workers=1)