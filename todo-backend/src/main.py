from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .db.session import engine
from .api.tasks import router as task_router
from .api.chat import router as chat_router
# from .api.ai_chat import router as ai_chat_router  # Temporarily disabled due to missing API key
from .api.reminders import router as reminders_router
from .api.notifications import router as notifications_router
from .api.websocket import websocket_endpoint
from .core.settings import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_base_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    SQLModel.metadata.create_all(engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to the DoQuanta Todo API"}

# Include API routers
app.include_router(task_router)
app.include_router(chat_router)
# app.include_router(ai_chat_router)  # Temporarily disabled due to missing API key
app.include_router(reminders_router)
app.include_router(notifications_router)

# WebSocket endpoint for real-time chat
app.websocket("/ws/{user_id}")(websocket_endpoint)
