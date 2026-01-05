from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from ..db.session import get_session
from ..models.models import User, ChatSession, ChatMessage as ChatMessageModel
from ..core.security import get_current_user_id
from uuid import uuid4


router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"
    description: Optional[str] = ""


class ChatMessageCreate(BaseModel):
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None


@router.post("/sessions", response_model=ChatSession)
def create_chat_session(
    *,
    session_data: ChatSessionCreate,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Create a new chat session."""
    session_id = str(uuid4())

    chat_session = ChatSession(
        id=session_id,
        user_id=current_user_id,
        title=session_data.title,
        description=session_data.description,
        created_at=datetime.now()
    )

    db_session.add(chat_session)
    db_session.commit()
    db_session.refresh(chat_session)

    return chat_session


@router.get("/sessions", response_model=List[ChatSession])
def list_chat_sessions(
    *,
    current_user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db_session: Session = Depends(get_session)
):
    """List all chat sessions for the authenticated user."""
    statement = select(ChatSession).where(ChatSession.user_id == current_user_id)
    sessions = db_session.exec(statement).all()
    return sessions


@router.get("/sessions/{session_id}", response_model=ChatSession)
def get_chat_session(
    *,
    session_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Get a specific chat session."""
    statement = select(ChatSession).where(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user_id
    )
    chat_session = db_session.exec(statement).first()

    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return chat_session


@router.post("/messages", response_model=ChatMessageModel)
def send_chat_message(
    *,
    message: ChatMessageCreate,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Send a message in a chat session."""
    # Verify that the session belongs to the user
    session_statement = select(ChatSession).where(
        ChatSession.id == message.session_id,
        ChatSession.user_id == current_user_id
    )
    chat_session = db_session.exec(session_statement).first()

    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Create the message
    message_id = str(uuid4())
    timestamp = message.timestamp or datetime.now()

    chat_message = ChatMessageModel(
        id=message_id,
        session_id=message.session_id,
        role=message.role,
        content=message.content,
        timestamp=timestamp
    )

    db_session.add(chat_message)
    db_session.commit()
    db_session.refresh(chat_message)

    return chat_message


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageModel])
def get_chat_messages(
    *,
    session_id: str,
    current_user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db_session: Session = Depends(get_session)
):
    """Get all messages in a chat session."""
    # Verify that the session belongs to the user
    session_statement = select(ChatSession).where(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user_id
    )
    chat_session = db_session.exec(session_statement).first()

    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Get messages for this session
    message_statement = select(ChatMessageModel).where(
        ChatMessageModel.session_id == session_id
    ).order_by(ChatMessageModel.timestamp)

    messages = db_session.exec(message_statement).all()
    return messages