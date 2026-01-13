from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio
import uuid
from sqlmodel import Session
from ..db.session import get_session
from ..models.models import Task
from sqlmodel import select
from datetime import datetime



class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                # Connection was already removed
                pass

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_user(self, message: str, user_id: str):
        if user_id in self.active_connections:
            active_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                    active_connections.append(connection)
                except:
                    # Connection is no longer active
                    continue

            # Update the list to only include active connections
            self.active_connections[user_id] = active_connections

    async def reconnect_user(self, user_id: str):
        """Attempt to reconnect a user if they have lost connection."""
        # This method can be used to notify the client to reconnect
        # In a real implementation, you might track connection attempts
        pass


manager = ConnectionManager()


async def handle_websocket_message(websocket: WebSocket, user_id: str, data: str):
    """Process incoming WebSocket messages and handle them appropriately."""
    try:
        message_data = json.loads(data)
        message_type = message_data.get("type")

        if message_type == "get_tasks":
            # Get tasks for user
            with next(get_session()) as session:
                statement = select(Task).where(Task.user_id == user_id)
                tasks = session.exec(statement).all()

                task_list = []
                for task in tasks:
                    task_list.append({
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "priority": task.priority,
                        "category": task.category,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                    })

                response = {
                    "type": "task_list",
                    "tasks": task_list
                }
                await manager.send_personal_message(json.dumps(response), websocket)

        elif message_type == "create_task":
            # Create new task
            title = message_data.get("title")
            description = message_data.get("description", "")
            priority = message_data.get("priority", "medium")
            category = message_data.get("category", "other")

            if not title:
                error_response = {
                    "type": "error",
                    "message": "Title is required"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                return

            with next(get_session()) as session:
                new_task = Task(
                    user_id=user_id,
                    title=title,
                    description=description,
                    priority=priority,
                    category=category,
                    completed=False,
                    created_at=datetime.now()
                )
                session.add(new_task)
                session.commit()
                session.refresh(new_task)

                response = {
                    "type": "task_created",
                    "task": {
                        "id": new_task.id,
                        "title": new_task.title,
                        "description": new_task.description,
                        "completed": new_task.completed,
                        "priority": new_task.priority,
                        "category": new_task.category,
                        "created_at": new_task.created_at.isoformat() if new_task.created_at else None,
                        "updated_at": new_task.updated_at.isoformat() if new_task.updated_at else None,
                    }
                }
                await manager.send_personal_message(json.dumps(response), websocket)

                # Broadcast to all user's connections
                broadcast_response = {
                    "type": "task_updated",
                    "action": "created",
                    "task": response["task"]
                }
                await manager.broadcast_to_user(json.dumps(broadcast_response), user_id)

        elif message_type == "update_task":
            # Update existing task
            task_id = message_data.get("task_id")
            title = message_data.get("title")
            description = message_data.get("description")
            completed = message_data.get("completed")
            priority = message_data.get("priority")
            category = message_data.get("category")

            if not task_id:
                error_response = {
                    "type": "error",
                    "message": "Task ID is required"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                return

            with next(get_session()) as session:
                statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
                db_task = session.exec(statement).first()

                if not db_task:
                    error_response = {
                        "type": "error",
                        "message": "Task not found or unauthorized"
                    }
                    await manager.send_personal_message(json.dumps(error_response), websocket)
                    return

                # Update fields if provided
                if title is not None:
                    db_task.title = title
                if description is not None:
                    db_task.description = description
                if completed is not None:
                    db_task.completed = completed
                if priority is not None:
                    db_task.priority = priority
                if category is not None:
                    db_task.category = category

                db_task.updated_at = datetime.now()
                session.add(db_task)
                session.commit()
                session.refresh(db_task)

                response = {
                    "type": "task_updated",
                    "action": "updated",
                    "task": {
                        "id": db_task.id,
                        "title": db_task.title,
                        "description": db_task.description,
                        "completed": db_task.completed,
                        "priority": db_task.priority,
                        "category": db_task.category,
                        "created_at": db_task.created_at.isoformat() if db_task.created_at else None,
                        "updated_at": db_task.updated_at.isoformat() if db_task.updated_at else None,
                    }
                }
                await manager.send_personal_message(json.dumps(response), websocket)

                # Broadcast to all user's connections
                await manager.broadcast_to_user(json.dumps(response), user_id)

        elif message_type == "delete_task":
            # Delete task
            task_id = message_data.get("task_id")

            if not task_id:
                error_response = {
                    "type": "error",
                    "message": "Task ID is required"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                return

            with next(get_session()) as session:
                statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
                db_task = session.exec(statement).first()

                if not db_task:
                    error_response = {
                        "type": "error",
                        "message": "Task not found or unauthorized"
                    }
                    await manager.send_personal_message(json.dumps(error_response), websocket)
                    return

                session.delete(db_task)
                session.commit()

                response = {
                    "type": "task_deleted",
                    "task_id": task_id
                }
                await manager.send_personal_message(json.dumps(response), websocket)

                # Broadcast to all user's connections
                broadcast_response = {
                    "type": "task_updated",
                    "action": "deleted",
                    "task_id": task_id
                }
                await manager.broadcast_to_user(json.dumps(broadcast_response), user_id)

        elif message_type == "chat_message":
            # Handle real-time chat message
            session_id = message_data.get("session_id")
            content = message_data.get("content")
            role = message_data.get("role", "user")

            if not session_id or not content:
                error_response = {
                    "type": "error",
                    "message": "Session ID and content are required for chat messages"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                return

            # In a real implementation, you would validate the session belongs to the user
            # and save the message to the database
            chat_response = {
                "type": "chat_message",
                "session_id": session_id,
                "message": {
                    "id": str(uuid.uuid4()),  # In real app, this would come from DB
                    "content": content,
                    "role": role,
                    "timestamp": datetime.now().isoformat()
                }
            }

            # Send the message back to the sender
            await manager.send_personal_message(json.dumps(chat_response), websocket)

            # In a real implementation, you might broadcast to other participants in the chat
            # For now, we'll just echo back to the sender

        elif message_type == "join_chat":
            # Handle joining a chat session
            session_id = message_data.get("session_id")

            if not session_id:
                error_response = {
                    "type": "error",
                    "message": "Session ID is required to join chat"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                return

            # In a real implementation, you would validate that the user has access to this session
            join_response = {
                "type": "joined_chat",
                "session_id": session_id,
                "message": f"Successfully joined chat session {session_id}"
            }

            await manager.send_personal_message(json.dumps(join_response), websocket)

        elif message_type == "ai_message":
            # Handle AI message request via WebSocket
            session_id = message_data.get("session_id")
            content = message_data.get("content")
            message_id = message_data.get("message_id", str(uuid.uuid4()))

            if not session_id or not content:
                error_response = {
                    "type": "error",
                    "message": "Session ID and content are required for AI messages"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                return

            # Send typing indicator
            typing_response = {
                "type": "typing",
                "session_id": session_id,
                "status": "started"
            }
            await manager.send_personal_message(json.dumps(typing_response), websocket)

            try:
                # Generate AI response - using the same approach as in main.py
                from ..core.settings import settings
                import os
                from openai import OpenAI

                # Get API key from environment
                gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY") or "dummy-key"

                # Create OpenAI client with Google's API
                client = OpenAI(
                    api_key=gemini_api_key,
                    base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
                )

                # Use the gemini model
                model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

                # Generate response
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are a helpful Doquanta AI assistant in a chatbot interface. Provide clear, concise, and helpful responses. Be friendly and conversational. Help users manage their tasks effectively."},
                        {"role": "user", "content": content}
                    ]
                )

                ai_response = response.choices[0].message.content

                # Send the AI response back to the user
                ai_response_message = {
                    "type": "ai_response",
                    "session_id": session_id,
                    "message": {
                        "id": str(uuid.uuid4()),
                        "content": ai_response,
                        "role": "assistant",
                        "timestamp": datetime.now().isoformat()
                    }
                }

                await manager.send_personal_message(json.dumps(ai_response_message), websocket)

            except Exception as e:
                # Send error response if AI generation fails
                error_response = {
                    "type": "error",
                    "message": f"AI response generation failed: {str(e)}"
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)

                # Send a fallback response
                fallback_response = {
                    "type": "ai_response",
                    "session_id": session_id,
                    "message": {
                        "id": str(uuid.uuid4()),
                        "content": "I'm sorry, I'm having trouble generating a response right now. Please try again later.",
                        "role": "assistant",
                        "timestamp": datetime.now().isoformat()
                    }
                }
                await manager.send_personal_message(json.dumps(fallback_response), websocket)

        else:
            error_response = {
                "type": "error",
                "message": f"Unknown message type: {message_type}"
            }
            await manager.send_personal_message(json.dumps(error_response), websocket)

    except json.JSONDecodeError:
        error_response = {
            "type": "error",
            "message": "Invalid JSON format"
        }
        await manager.send_personal_message(json.dumps(error_response), websocket)
    except Exception as e:
        error_response = {
            "type": "error",
            "message": f"Error processing message: {str(e)}"
        }
        await manager.send_personal_message(json.dumps(error_response), websocket)


# WebSocket endpoint
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time task updates."""
    await manager.connect(websocket, user_id)

    # Send connection confirmation
    connection_msg = {
        "type": "connection",
        "message": "Connected to WebSocket server",
        "user_id": user_id,
        "timestamp": datetime.now().isoformat()
    }
    await manager.send_personal_message(json.dumps(connection_msg), websocket)

    try:
        while True:
            data = await websocket.receive_text()
            await handle_websocket_message(websocket, user_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        print(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)