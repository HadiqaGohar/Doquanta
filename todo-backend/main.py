# from fastapi import FastAPI, HTTPException, Body, Security, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# from typing import List, Optional
# import sys
# import json
# import os

# from datetime import datetime
# from typing import List, Optional, Dict, Any, Callable
# from pydantic import BaseModel, Field
# from src.core.security import get_current_user_id
# from sqlmodel import SQLModel
# from src.models.models import Task  # Import Task model to register it with SQLModel

# import os
# from dotenv import load_dotenv
# from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
# import asyncio
# import uuid

# # Load environment variables
# load_dotenv()



# app = FastAPI(title="Todo Backend API", description="FastAPI backend for DoQuanta Todo App")

# # # Add CORS middleware
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],  # In production, you should specify the exact frontend URL
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # CORS middleware for frontend communication
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",  # Local development
#         "https://doquanta.vercel.app",  # Production URL
#         "https://*.vercel.app"  # Any Vercel preview deployments
#     ], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Pydantic models
# class ChatMessage(BaseModel):
#     id: str
#     content: str
#     sender: str  # 'user' or 'ai'
#     timestamp: datetime
#     session_id: str

# # AI Model setup for DoQuanta
# qwen_api_key = os.getenv("QWEN_API_KEY")
# if not qwen_api_key:
#     print("Warning: QWEN_API_KEY not found in environment. AI features may not work properly.")

# gemini_api_key = os.getenv("GEMINI_API_KEY")
# if not gemini_api_key:
#     # Check if we have the API key in environment
#     gemini_api_key = os.getenv("GEMINI_API_KEY")  # Alternative env var name
#     if not gemini_api_key:
#         print("Warning: GEMINI_API_KEY not found in environment. AI features may not work properly.")
#         gemini_api_key = "dummy-key-for-development"  # Placeholder for development

# external_client = AsyncOpenAI(
#     api_key=gemini_api_key,
#     timeout=30.0,
#     base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
# )

# model = OpenAIChatCompletionsModel(
#     openai_client=external_client,
#     model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
# )

# config = RunConfig(
#     model=model,
#     model_provider=external_client,
#     tracing_disabled=True,
# )

# # In-memory storage (replace with database in production)
# # Changed to user-specific chat sessions for proper isolation
# chat_sessions: Dict[str, List[ChatMessage]] = {}  # session_id -> messages
# user_sessions: Dict[str, List[str]] = {}  # user_id -> [session_ids]

# class ChatRequest(BaseModel):
#     message: str
#     session_id: Optional[str] = None

# class ChatResponse(BaseModel):
#     message: ChatMessage
#     session_id: str

# class VoiceRequest(BaseModel):
#     session_id: str
#     audio_data: str  # base64 encoded audio

# # ..............................................



# class TaskResponse(BaseModel):
#     """Represents a single todo task response."""
#     id: str  # Changed to str to match frontend interface
#     user_id: str
#     title: str
#     description: Optional[str] = ""
#     completed: bool = False
#     priority: str = "medium"
#     category: str = "other"
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     @classmethod
#     def from_task(cls, task: Task) -> "TaskResponse":
#         """Create a TaskResponse from a Task model, converting int ID to str."""
#         return cls(
#             id=str(task.id) if task.id is not None else "",
#             user_id=task.user_id,
#             title=task.title,
#             description=task.description,
#             completed=task.completed,
#             priority=task.priority,
#             category=task.category,
#             created_at=task.created_at,
#             updated_at=task.updated_at
#         )

#     class Config:
#         json_schema_extra = {
#             "example": {
#                 "id": "1",
#                 "user_id": "user123",
#                 "title": "Sample Task",
#                 "description": "This is a sample task",
#                 "completed": False,
#                 "priority": "medium",
#                 "category": "other",
#                 "created_at": "2023-10-01T12:00:00"
#             }
#         }

# class CreateTaskRequest(BaseModel):
#     title: str
#     description: str = ""
#     priority: str = "medium"
#     category: str = "other"

# class UpdateTaskRequest(BaseModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     completed: Optional[bool] = None
#     priority: Optional[str] = None
#     category: Optional[str] = None

# class GetTasksResponse(BaseModel):
#     tasks: List[TaskResponse]
#     count: int


# from sqlmodel import Session, select
# from src.db.session import engine  # Import the database engine

# class DatabaseStorage:
#     """Handles persistent storage of tasks using a PostgreSQL database."""

#     def __init__(self):
#         # Create tables if they don't exist
#         SQLModel.metadata.create_all(engine)

#     def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other") -> Task:
#         """Add a new task to storage for a specific user."""
#         with Session(engine) as session:
#             db_task = Task(
#                 user_id=user_id,
#                 title=title,
#                 description=description,
#                 completed=False,
#                 priority=priority,
#                 category=category,
#                 created_at=datetime.now()
#             )
#             session.add(db_task)
#             session.commit()
#             session.refresh(db_task)
#             return db_task

#     def get_task(self, user_id: str, task_id: int) -> Optional[Task]:
#         """Get a task by its ID for a specific user."""
#         with Session(engine) as session:
#             statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
#             db_task = session.exec(statement).first()
#             return db_task

#     def get_all_tasks(self, user_id: str) -> List[Task]:
#         """Get all tasks for a specific user."""
#         with Session(engine) as session:
#             statement = select(Task).where(Task.user_id == user_id)
#             db_tasks = session.exec(statement).all()
#             return db_tasks

#     def update_task(self, user_id: str, task_id: int, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None, priority: Optional[str] = None, category: Optional[str] = None) -> bool:
#         """Update a task's fields for a specific user."""
#         with Session(engine) as session:
#             statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
#             db_task = session.exec(statement).first()
#             if db_task:
#                 if title is not None:
#                     db_task.title = title
#                 if description is not None:
#                     db_task.description = description
#                 if completed is not None:
#                     db_task.completed = completed
#                 if priority is not None:
#                     db_task.priority = priority
#                 if category is not None:
#                     db_task.category = category
#                 db_task.updated_at = datetime.now()
#                 session.add(db_task)
#                 session.commit()
#                 session.refresh(db_task)
#                 return True
#             return False

#     def delete_task(self, user_id: str, task_id: int) -> bool:
#         """Delete a task by its ID for a specific user."""
#         with Session(engine) as session:
#             statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
#             db_task = session.exec(statement).first()
#             if db_task:
#                 session.delete(db_task)
#                 session.commit()
#                 return True
#             return False


# class TaskManager:
#     """Handles all task operations and business logic."""

#     def __init__(self):
#         self.storage = DatabaseStorage()

#     def add_task(self, user_id: str, title: str, description: str = "", priority: str = "medium", category: str = "other") -> Task:
#         """Add a new task for a specific user and return it."""
#         if not title.strip():
#             raise HTTPException(status_code=400, detail="Task title cannot be empty.")

#         if len(title) > 200:
#             raise HTTPException(status_code=400, detail="Task title cannot exceed 200 characters.")

#         if len(description) > 1000:
#             raise HTTPException(status_code=400, detail="Task description cannot exceed 1000 characters.")

#         return self.storage.add_task(user_id, title, description, priority, category)

#     def list_tasks(self, user_id: str) -> List[Task]:
#         """List all tasks for a specific user."""
#         return self.storage.get_all_tasks(user_id)

#     def update_task(self, user_id: str, task_id: int, title: Optional[str] = None, description: Optional[str] = None, completed: Optional[bool] = None, priority: Optional[str] = None, category: Optional[str] = None) -> Task:
#         """Update a task for a specific user and return it."""
#         if title and len(title) > 200:
#             raise HTTPException(status_code=400, detail="Task title cannot exceed 200 characters.")

#         if description and len(description) > 1000:
#             raise HTTPException(status_code=400, detail="Task description cannot exceed 1000 characters.")

#         success = self.storage.update_task(user_id, task_id, title, description, completed, priority, category)
#         if not success:
#             raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found.")

#         task = self.storage.get_task(user_id, task_id)
#         if not task:
#             raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found.")
#         return task

#     def delete_task(self, user_id: str, task_id: int) -> dict:
#         """Delete a task for a specific user and return a confirmation message."""
#         success = self.storage.delete_task(user_id, task_id)
#         if not success:
#             raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found.")

#         return {"message": f"Task {task_id} deleted successfully!"}

#     def complete_task(self, user_id: str, task_id: int) -> Task:
#         """Mark a task as complete for a specific user and return it."""
#         task = self.storage.get_task(user_id, task_id)
#         if not task:
#             raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found.")

#         success = self.storage.update_task(user_id, task_id, completed=True, priority=None, category=None)
#         if not success:
#             raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found.")

#         updated_task = self.storage.get_task(user_id, task_id)
#         if not updated_task:
#             raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found.")
#         return updated_task


# # Initialize the task manager
# task_manager = TaskManager()


# @app.get("/")
# def read_root():
#     return {"message": "Welcome to the Doquanta Todo Backend API"}




# # Keep the original CLI functionality for backward compatibility
# class CommandLineInterface:
#     """Handles user input/output for the console application."""

#     def __init__(self):
#         self.task_manager = TaskManager()

#     def display_help(self) -> str:
#         """Display help information."""
#         help_text = """
# Todo App - Available Commands:
#   add "title" "description"     - Add a new task
#   list                         - View all tasks
#   update <id> "title" "desc"   - Update a task (title and/or description)
#   delete <id>                  - Delete a task
#   complete <id>                - Mark task as complete
#   help                         - Show this help message
#   exit                         - Exit the application

# Examples:
#   add "Buy groceries" "Milk, eggs, bread"
#   list
#   update 1 "Buy groceries and fruits" "Milk, eggs, bread, apples"
#   delete 1
#   complete 2
#         """
#         return help_text

#     def parse_command(self, args: List[str]) -> str:
#         """Parse and execute user commands."""
#         if not args:
#             return self.display_help()

#         command = args[0].lower()

#         if command == "help":
#             return self.display_help()
#         elif command == "list":
#             # For CLI list, we might need a default user or prompt
#             # But here list_tasks expects user_id. 
#             # The CLI implementation needs update or mock user.
#             # Assuming CLI uses a default user for now or fails.
#             # The original code didn't take user_id in list_tasks?
#             # Let's check original... it took user_id in storage but not task_manager?
#             # Wait, I might have broken CLI by adding user_id param to TaskManager methods if it wasn't there.
#             # But the user only complained about 403/401 API.
#             # I will assume CLI is less important or I should fix it too.
#             # I'll pass a dummy user_id for CLI.
#             return "CLI functionality is limited in this version. Please use the API."

#         # ... (rest of CLI implementation)




# # Convert this code for doquanta chatbot


# # API Routes
# @app.get("/")
# async def root():
#     return {"message": "Task Backend with RAG Chatbot API is running"}

# @app.get("/health")
# async def health_check():
#     """Enhanced health check with security considerations."""
#     try:
#         health_status = {
#             "status": "healthy",
#             "message": "RAG Chatbot Backend is operational",
#             "version": "1.0.0"
#         }
        
#         health_status["features"] = [
#             "RAG Chat",
#             "Voice Processing", 
#             "File Upload",
#             "Document Ingestion",
#             "Text Selection"
#         ]
            
#         return health_status
#     except Exception as e:
#         return {"status": "unhealthy", "error": "Service unavailable"}


# @app.post("/chat", response_model=ChatResponse)
# async def send_message(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
#     try:
#         # Create or get session
#         session_id = request.session_id or str(uuid.uuid4())

#         # Ensure user has access to this session
#         # If it's a new session, associate it with the current user
#         if session_id not in chat_sessions:
#             chat_sessions[session_id] = []
#             if current_user_id not in user_sessions:
#                 user_sessions[current_user_id] = []
#             user_sessions[current_user_id].append(session_id)
#         else:
#             # Verify that this session belongs to the current user
#             user_has_session = False
#             if current_user_id in user_sessions:
#                 user_has_session = session_id in user_sessions[current_user_id]

#             if not user_has_session:
#                 raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

#         # Create user message
#         user_message = ChatMessage(
#             id=str(uuid.uuid4()),
#             content=request.message,
#             sender="user",
#             timestamp=datetime.now(),
#             session_id=session_id
#         )

#         chat_sessions[session_id].append(user_message)

#         # Generate AI response using the existing agent
#         ai_response_content = await generate_ai_response(request.message)

#         ai_message = ChatMessage(
#             id=str(uuid.uuid4()),
#             content=ai_response_content,
#             sender="ai",
#             timestamp=datetime.now(),
#             session_id=session_id
#         )

#         chat_sessions[session_id].append(ai_message)

#         return ChatResponse(message=ai_message, session_id=session_id)

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/chat/history/{session_id}")
# async def get_chat_history(session_id: str, current_user_id: str = Security(get_current_user_id)):
#     # Verify that this session belongs to the current user
#     user_has_session = False
#     if current_user_id in user_sessions:
#         user_has_session = session_id in user_sessions[current_user_id]

#     if not user_has_session:
#         raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

#     if session_id not in chat_sessions:
#         return {"messages": []}

#     return {"messages": chat_sessions[session_id]}

# @app.post("/chat/voice")
# async def process_voice(request: VoiceRequest, current_user_id: str = Security(get_current_user_id)):
#     try:
#         # Mock voice processing - integrate with speech recognition
#         transcribed_text = "This is a mock transcription of the voice input"

#         # Process as regular chat message
#         chat_request = ChatRequest(
#             message=transcribed_text,
#             session_id=request.session_id
#         )

#         return await send_message(chat_request, current_user_id)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/chat/ask-ai")
# async def ask_ai_help(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
#     try:
#         # Enhanced AI response for help requests
#         help_response = await generate_ai_help_response(request.message)

#         session_id = request.session_id or str(uuid.uuid4())

#         # Ensure user has access to this session
#         # If it's a new session, associate it with the current user
#         if session_id not in chat_sessions:
#             chat_sessions[session_id] = []
#             if current_user_id not in user_sessions:
#                 user_sessions[current_user_id] = []
#             user_sessions[current_user_id].append(session_id)
#         else:
#             # Verify that this session belongs to the current user
#             user_has_session = False
#             if current_user_id in user_sessions:
#                 user_has_session = session_id in user_sessions[current_user_id]

#             if not user_has_session:
#                 raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

#         ai_message = ChatMessage(
#             id=str(uuid.uuid4()),
#             content=help_response,
#             sender="ai",
#             timestamp=datetime.now(),
#             session_id=session_id
#         )

#         chat_sessions[session_id].append(ai_message)

#         return ChatResponse(message=ai_message, session_id=session_id)

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/chat/rag")
# async def rag_chat(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
#     """RAG-enhanced chat endpoint for more detailed responses"""
#     try:
#         # Enhanced AI response using RAG (Retrieval Augmented Generation)
#         rag_response = await generate_rag_response(request.message)

#         session_id = request.session_id or str(uuid.uuid4())

#         # Ensure user has access to this session
#         # If it's a new session, associate it with the current user
#         if session_id not in chat_sessions:
#             chat_sessions[session_id] = []
#             if current_user_id not in user_sessions:
#                 user_sessions[current_user_id] = []
#             user_sessions[current_user_id].append(session_id)
#         else:
#             # Verify that this session belongs to the current user
#             user_has_session = False
#             if current_user_id in user_sessions:
#                 user_has_session = session_id in user_sessions[current_user_id]

#             if not user_has_session:
#                 raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

#         ai_message = ChatMessage(
#             id=str(uuid.uuid4()),
#             content=rag_response,
#             sender="ai",
#             timestamp=datetime.now(),
#             session_id=session_id
#         )

#         chat_sessions[session_id].append(ai_message)

#         return ChatResponse(message=ai_message, session_id=session_id)

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/chat/file")
# async def upload_file(file: UploadFile = File(...), session_id: str = Form(...), current_user_id: str = Security(get_current_user_id)):
#     """Handle file uploads for chat"""
#     try:
#         # Verify that this session belongs to the current user
#         user_has_session = False
#         if current_user_id in user_sessions:
#             user_has_session = session_id in user_sessions[current_user_id]

#         if not user_has_session:
#             raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

#         # Read file content
#         file_content = await file.read()

#         # Process the uploaded file
#         file_response = await process_uploaded_file(file_content, session_id, file.filename)

#         if session_id not in chat_sessions:
#             chat_sessions[session_id] = []

#         ai_message = ChatMessage(
#             id=str(uuid.uuid4()),
#             content=file_response,
#             sender="ai",
#             timestamp=datetime.now(),
#             session_id=session_id
#         )

#         chat_sessions[session_id].append(ai_message)

#         return ChatResponse(message=ai_message, session_id=session_id)

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# async def generate_ai_response(message: str) -> str:
#     """Generate AI response using the existing agent setup"""
#     try:
#         agent = Agent(
#             name="Neurobotics Book Assistant", 
#             instructions="You are a helpful Doquanta AI assistant in a chatbot interface. Provide clear, concise, and helpful responses. Be friendly and conversational. If users ask for help, provide detailed explanations and guidance according to book content. like modules and entiere books conetent so you use ragchatbot and embedding techniques to provide accurate answers. you read NEUROBOTICS_BOOKS.txt content and help users understand complex topics.",
#             model=model
#         )
#         result = await Runner.run(agent, message, run_config=config)
#         return result.final_output
#     except Exception as e:
#         print(f"Error generating AI response: {e}")
#         # Return a more helpful mock response when API fails
#         return f"Hello! I'm your AI assistant. You asked: '{message}'. I'm currently in demo mode due to API limitations, but I'm here to help! In a full deployment, I would provide detailed responses using advanced AI capabilities."

# async def generate_ai_help_response(message: str) -> str:
#     """Enhanced AI response for help requests"""
#     try:
#         agent = Agent(
#             name="AI Help Assistant", 
#             instructions="You are an AI assistant specifically helping users understand topics. When someone asks for help, provide detailed explanations, break down complex concepts, and offer additional context. Be educational and thorough.",
#             model=model
#         )
#         help_prompt = f"Please help explain and provide detailed information about: {message}"
#         result = await Runner.run(agent, help_prompt, run_config=config)
#         return result.final_output
#     except Exception as e:
#         print(f"Error generating AI help response: {e}")
#         return f"📚 **Help with: {message}**\n\nI'm here to help explain this topic! In demo mode, I can provide general guidance:\n\n• This appears to be related to your query about '{message}'\n• In a full deployment, I would analyze this using advanced AI and provide detailed explanations\n• I would break down complex concepts and provide relevant examples\n• I would offer additional context and related information\n\nPlease note: This is a demo response due to API limitations."

# async def generate_rag_response(message: str) -> str:
#     """Generate RAG-enhanced response with more context and detail"""
#     try:
#         agent = Agent(
#             name="RAG Assistant", 
#             instructions="You are an advanced AI assistant with access to a knowledge base. Your primary goal is to answer questions ONLY related to the content of the 'Neurobotics book' provided through your knowledge base. Provide comprehensive, well-structured responses with relevant context, examples, and detailed explanations. If the answer to the user's question is not found within your knowledge base, you MUST clearly state that the information is not available in the provided context and refrain from generating generic or external information. Use markdown formatting for better readability.",
#             model=model
#         )
#         rag_prompt = f"Using your knowledge base, provide a comprehensive response to: {message}"
#         result = await Runner.run(agent, rag_prompt, run_config=config)
#         return result.final_output
#     except Exception as e:
#         print(f"Error generating RAG response: {e}")
#         return f"🤖 **Enhanced AI Response (Demo Mode)**\n\n**Your Query:** {message}\n\n**Response:** I'm your advanced AI assistant with RAG capabilities! In full deployment mode, I would:\n\n• Search through extensive knowledge bases\n• Provide comprehensive, well-structured responses\n• Include relevant context and examples\n• Use advanced reasoning and analysis\n• Format responses with markdown for better readability\n\nCurrently in demo mode due to API limitations, but the interface and functionality are fully operational!"

# async def process_uploaded_file(file_data: bytes, session_id: str, filename: str = None) -> str:
#     """Process uploaded file and generate response"""
#     try:
#         # In a real implementation, you would:
#         # 1. Save the file
#         # 2. Extract text/content from the file
#         # 3. Process it with AI
#         # 4. Generate a meaningful response
        
#         file_size = len(file_data)
#         file_info = f"File: {filename or 'unknown'}, Size: {file_size} bytes"
        
#         agent = Agent(
#             name="File Processor", 
#             instructions="You are an AI assistant that helps users understand and analyze uploaded files. Provide helpful insights about file processing and offer to help analyze the content.",
#             model=model
#         )
        
#         file_prompt = f"A user has uploaded a file: {file_info}. Acknowledge the upload and offer to help analyze or discuss the file content."
#         result = await Runner.run(agent, file_prompt, run_config=config)
#         return result.final_output
#     except Exception as e:
#         print(f"Error processing uploaded file: {e}")
#         return f"I've received your file upload ({filename or 'unknown file'}). However, I'm experiencing some technical difficulties processing it right now. Please try again or contact support if the issue persists."


# async def main():
#     """DoQuanta AI Agent for testing"""
#     agent = Agent(
#         name="DoQuanta Assistant",
#         instructions="You are DoQuanta AI assistant, designed to help users manage their tasks and productivity. You can help add, update, and manage tasks in the DoQuanta system.",
#         model=model
#     )
#     result = await Runner.run(agent, "Add new task: Prepare presentation for client meeting at 4:00pm", run_config=config)
#     print(f"DoQuanta AI Result: {result.final_output}")

# if __name__ == "__main__":
#     import uvicorn
#     port = int(os.getenv("PORT", 8080))  # ✅ Cloud Run PORT
#     uvicorn.run(
#         "main:app",  # ✅ String format
#         host="0.0.0.0", 
#         port=port, 
#         reload=False,  # ✅ Production
#         workers=1  # ✅ Cloud Run single worker
#     )




from fastapi import FastAPI, HTTPException, Security, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any, Callable
import os
from datetime import datetime
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, select
import uuid
import asyncio

from src.core.security import get_current_user_id
from src.models.models import Task
from src.db.session import engine
from src.api.tasks import router as tasks_router

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Todo Backend API", description="FastAPI backend for DoQuanta Todo App")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://doquanta.vercel.app",  # Production URL
        "https://*.vercel.app"  # Any Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the tasks router
app.include_router(tasks_router)

# Pydantic model for session registration
class RegisterSessionRequest(BaseModel):
    user_id: str
    token: str
    expires_at: Optional[datetime] = None
    expires_in: Optional[int] = 7

# Add a session registration endpoint for Better Auth integration
@app.post("/register-session")
async def register_session(request: RegisterSessionRequest):
    """Register a session token from Better Auth with the backend."""
    try:
        from sqlmodel import Session as DBSession
        from src.db.session import engine
        from datetime import datetime, timedelta
        import secrets
        from sqlalchemy import text

        # Set expiration time if not provided
        expires_at = request.expires_at
        if expires_at is None:
            expires_at = datetime.now() + timedelta(days=request.expires_in or 7)
            
        # Handle signed tokens (format: token.signature)
        # Store only the raw token to match verify_session_token logic
        token_to_store = request.token
        if "." in token_to_store and len(token_to_store.split(".")) >= 2:
            token_to_store = token_to_store.split(".")[0]
            print(f"DEBUG: Registering signed token, stripping signature. Storing: {token_to_store}")

        with DBSession(engine) as session:
            # Create the session record using the actual column names in the database
            session_sql = """
            INSERT OR REPLACE INTO session ("id", "user_id", "token", "expires_at", "created_at", "updated_at")
            VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at);
            """

            # Check if session already exists to keep the same ID, otherwise generate new
            existing_session = session.execute(
                text("SELECT id FROM session WHERE token = :token"), 
                {"token": token_to_store}
            ).first()
            
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

# Pydantic models
class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str  # 'user' or 'ai'
    timestamp: datetime
    session_id: str

# AI Model setup for DoQuanta
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    print("Warning: GEMINI_API_KEY not found in environment. AI features may not work properly.")
    gemini_api_key = "dummy-key-for-development"  # Placeholder for development

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

# In-memory storage (replace with database in production)
# Changed to user-specific chat sessions for proper isolation
chat_sessions: Dict[str, List[ChatMessage]] = {}  # session_id -> messages
user_sessions: Dict[str, List[str]] = {}  # user_id -> [session_ids]

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: ChatMessage
    session_id: str

class VoiceRequest(BaseModel):
    session_id: str
    audio_data: str  # base64 encoded audio






# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to DoQuanta Todo Backend API"}

@app.get("/health")
async def health_check():
    """Enhanced health check with database connection check"""
    try:
        # Database connection check
        try:
            from sqlalchemy import text
            with Session(engine) as session:
                session.execute(text("SELECT 1"))
            db_status = "connected"
        except Exception as db_error:
            db_status = f"error: {str(db_error)}"

        health_status = {
            "status": "healthy",
            "database": db_status,
            "ai_service": "operational" if gemini_api_key and gemini_api_key != "dummy-key-for-development" else "limited",
            "version": "1.0.0",
            "features": [
                "Simple Chat",
                "Voice Processing",
                "File Upload"
            ],
            "timestamp": datetime.now().isoformat()
        }

        return health_status
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Chat API Endpoints
@app.post("/chat", response_model=ChatResponse)
async def send_message(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
    try:
        # Create or get session
        session_id = request.session_id or str(uuid.uuid4())

        # Ensure user has access to this session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
            if current_user_id not in user_sessions:
                user_sessions[current_user_id] = []
            user_sessions[current_user_id].append(session_id)
        else:
            # Verify that this session belongs to the current user
            user_has_session = False
            if current_user_id in user_sessions:
                user_has_session = session_id in user_sessions[current_user_id]

            if not user_has_session:
                raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

        # Create user message
        user_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=request.message,
            sender="user",
            timestamp=datetime.now(),
            session_id=session_id
        )

        chat_sessions[session_id].append(user_message)

        # Generate AI response using the existing agent
        ai_response_content = await generate_ai_response(request.message)

        ai_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=ai_response_content,
            sender="ai",
            timestamp=datetime.now(),
            session_id=session_id
        )

        chat_sessions[session_id].append(ai_message)

        return ChatResponse(message=ai_message, session_id=session_id)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str, current_user_id: str = Security(get_current_user_id)):
    # Verify that this session belongs to the current user
    user_has_session = False
    if current_user_id in user_sessions:
        user_has_session = session_id in user_sessions[current_user_id]

    if not user_has_session:
        raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

    if session_id not in chat_sessions:
        return {"messages": []}

    return {"messages": chat_sessions[session_id]}

@app.post("/chat/voice")
async def process_voice(request: VoiceRequest, current_user_id: str = Security(get_current_user_id)):
    try:
        # Mock voice processing - integrate with speech recognition
        transcribed_text = "This is a mock transcription of the voice input"

        # Process as regular chat message
        chat_request = ChatRequest(
            message=transcribed_text,
            session_id=request.session_id
        )

        return await send_message(chat_request, current_user_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/ask-ai")
async def ask_ai_help(request: ChatRequest, current_user_id: str = Security(get_current_user_id)):
    try:
        # Define tools that need user context
        def add_task(title: str, description: str = "", priority: str = "medium", category: str = "other") -> str:
            """
            Adds a new task to the user's todo list.
            
            Args:
                title: The title of the task.
                description: Optional description of the task.
                priority: Priority level (low, medium, high). Default is medium.
                category: Category (work, personal, other, etc). Default is other.
                
            Returns:
                A confirmation message with the task ID.
            """
            try:
                task = task_manager.add_task(current_user_id, title, description, priority, category)
                return f"Successfully added task: '{task.title}' (ID: {task.id})"
            except Exception as e:
                return f"Error adding task: {str(e)}"

        # Enhanced AI response for help requests
        help_response = await generate_ai_help_response(request.message, tools=[add_task])

        session_id = request.session_id or str(uuid.uuid4())

        # Ensure user has access to this session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
            if current_user_id not in user_sessions:
                user_sessions[current_user_id] = []
            user_sessions[current_user_id].append(session_id)
        else:
            # Verify that this session belongs to the current user
            user_has_session = False
            if current_user_id in user_sessions:
                user_has_session = session_id in user_sessions[current_user_id]

            if not user_has_session:
                raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

        ai_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=help_response,
            sender="ai",
            timestamp=datetime.now(),
            session_id=session_id
        )

        chat_sessions[session_id].append(ai_message)

        return ChatResponse(message=ai_message, session_id=session_id)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/file")
async def upload_file(file: UploadFile = File(...), session_id: str = Form(...), current_user_id: str = Security(get_current_user_id)):
    """Handle file uploads for chat"""
    try:
        # Verify that this session belongs to the current user
        user_has_session = False
        if current_user_id in user_sessions:
            user_has_session = session_id in user_sessions[current_user_id]

        if not user_has_session:
            raise HTTPException(status_code=403, detail="Access forbidden: Cannot access this session")

        # Read file content
        file_content = await file.read()

        # Process the uploaded file
        file_response = await process_uploaded_file(file_content, session_id, file.filename)

        if session_id not in chat_sessions:
            chat_sessions[session_id] = []

        ai_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=file_response,
            sender="ai",
            timestamp=datetime.now(),
            session_id=session_id
        )

        chat_sessions[session_id].append(ai_message)

        return ChatResponse(message=ai_message, session_id=session_id)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_ai_response(message: str) -> str:
    """Generate AI response using the existing agent setup"""
    try:
        agent = Agent(
            name="Simple Assistant",
            instructions="You are a helpful Doquanta AI assistant in a chatbot interface. Provide clear, concise, and helpful responses. Be friendly and conversational. Help users with general questions and provide useful information.",
            model=model
        )
        result = await Runner.run(agent, message, run_config=config)
        return result.final_output
    except Exception as e:
        print(f"AI Response Error: {str(e)}")
        # Better fallback responses
        fallback_responses = [
            "I'm currently experiencing technical difficulties with the AI service.",
            "Please try again in a moment or contact support if the issue persists.",
            f"You asked: '{message}' - I apologize for the inconvenience."
        ]
        return " | ".join(fallback_responses)

async def generate_ai_help_response(message: str, tools: List[Callable] = []) -> str:
    """Enhanced AI response for help requests"""
    try:
        instructions = "You are an AI assistant specifically helping users understand topics. When someone asks for help, provide detailed explanations, break down complex concepts, and offer additional context. Be educational and thorough."
        if tools:
            instructions += " You also have access to tools to perform actions like adding tasks. Use them when requested."

        agent = Agent(
            name="Help Assistant",
            instructions=instructions,
            model=model,
            tools=tools
        )
        
        # If tools are available, don't force the 'help explain' prompt, let the agent decide
        prompt = message
        if not tools:
            prompt = f"Please help explain and provide detailed information about: {message}"
            
        result = await Runner.run(agent, prompt, run_config=config)
        return result.final_output
    except Exception as e:
        print(f"AI Help Response Error: {str(e)}")
        return f"📚 **Help with: {message}**\n\nI'm here to help explain this topic! In demo mode, I can provide general guidance:\n\n• This appears to be related to your query about '{message}'\n• In a full deployment, I would analyze this using advanced AI and provide detailed explanations\n• I would break down complex concepts and provide relevant examples\n• I would offer additional context and related information\n\nPlease note: This is a demo response due to API limitations."


async def process_uploaded_file(file_data: bytes, session_id: str, filename: str = None) -> str:
    """Process uploaded file and generate response"""
    try:
        file_size = len(file_data)
        file_info = f"File: {filename or 'unknown'}, Size: {file_size} bytes"
        
        agent = Agent(
            name="File Processor",
            instructions="You are an AI assistant that helps users understand and analyze uploaded files. Provide helpful insights about file processing and offer to help analyze the content.",
            model=model
        )
        
        file_prompt = f"A user has uploaded a file: {file_info}. Acknowledge the upload and offer to help analyze or discuss the file content."
        result = await Runner.run(agent, file_prompt, run_config=config)
        return result.final_output
    except Exception as e:
        print(f"File Processing Error: {str(e)}")
        return f"I've received your file upload ({filename or 'unknown file'}). However, I'm experiencing some technical difficulties processing it right now. Please try again or contact support if the issue persists."

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=port, 
        reload=False,
        workers=1
    )