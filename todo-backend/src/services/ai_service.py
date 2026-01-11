import json
import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session, select
from src.models.models import Task
from src.db.session import engine
from src.services.date_time_parser import date_time_parser_service
from openai import AsyncOpenAI, RateLimitError, APIError

# Configure logging
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found.")
            
        self.client = AsyncOpenAI(
            api_key=self.api_key or "dummy-key",
            base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
        )
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        # Fallback to a different model family/size to avoid hitting the same rate limit or issue
        self.fallback_model = "gemini-1.5-pro" 
        
        logger.info(f"AIService initialized with model={self.model}, fallback={self.fallback_model}")

    # --- Tool Implementations ---

    def _get_tasks(self, user_id: str, status: str = "all") -> str:
        """Helper to fetch tasks from DB."""
        with Session(engine) as session:
            query = select(Task).where(Task.user_id == user_id)
            if status == "pending":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)
            
            tasks = session.exec(query).all()
            if not tasks:
                return "You have no tasks matching that criteria."
            
            result = []
            for t in tasks:
                status_icon = "✅" if t.completed else "⬜"
                due = f"(Due: {t.due_date.strftime('%Y-%m-%d %H:%M')})" if t.due_date else ""
                result.append(f"{t.id}. {status_icon} {t.title} {due}")
            
            return "\n".join(result)

    def _add_task(self, user_id: str, title: str, due_date: str = None, priority: str = "medium", category: str = "other") -> str:
        with Session(engine) as session:
            parsed_date = None
            if due_date:
                parsed_date = date_time_parser_service.parse_datetime(due_date)

            task = Task(
                user_id=user_id,
                title=title,
                priority=priority,
                category=category,
                due_date=parsed_date,
                created_at=datetime.now()
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            
            due_str = f" due on {task.due_date}" if task.due_date else ""
            return f"Task '{task.title}' added successfully{due_str} (ID: {task.id})."

    def _complete_task(self, user_id: str, task_id: int) -> str:
        with Session(engine) as session:
            task = session.get(Task, task_id)
            if not task or task.user_id != user_id:
                return f"Task with ID {task_id} not found."
            
            task.completed = True
            task.updated_at = datetime.now()
            session.add(task)
            session.commit()
            return f"Task '{task.title}' marked as completed."

    def _delete_task(self, user_id: str, task_id: int) -> str:
        with Session(engine) as session:
            task = session.get(Task, task_id)
            if not task or task.user_id != user_id:
                return f"Task with ID {task_id} not found."
            
            title = task.title
            session.delete(task)
            session.commit()
            return f"Task '{title}' deleted."

    # --- Tool Definitions (Schema) ---

    @property
    def tools(self):
        return [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task to the todo list.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The task title/description"},
                            "due_date": {"type": "string", "description": "Due date in natural language (e.g. 'tomorrow 5pm')"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                            "category": {"type": "string"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List my tasks. Can filter by status (pending/completed).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string", "enum": ["all", "pending", "completed"], "default": "all"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed by ID. First list tasks to get IDs if needed.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "The numeric ID of the task to complete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task by ID. First list tasks to get IDs if needed.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "The numeric ID of the task to delete"}
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]

    # --- Main Logic ---

    async def _call_llm(self, messages, tools=None, tool_choice=None, model=None):
        """Internal helper to call LLM with error handling."""
        use_model = model or self.model
        try:
            return await self.client.chat.completions.create(
                model=use_model,
                messages=messages,
                tools=tools,
                tool_choice=tool_choice
            )
        except (RateLimitError, APIError) as e:
            # If we hit a rate limit or API error with the primary model, and it's not the fallback
            if "429" in str(e) or isinstance(e, RateLimitError):
                logger.warning(f"Rate limit hit for model {use_model}. Switching to fallback: {self.fallback_model}")
                if use_model != self.fallback_model:
                    return await self.client.chat.completions.create(
                        model=self.fallback_model,
                        messages=messages,
                        tools=tools,
                        tool_choice=tool_choice
                    )
            raise e

    async def process_message(self, user_id: str, message: str) -> str:
        """
        Process a user message, execute tools if needed, and return the AI response.
        """
        messages = [
            {"role": "system", "content": f"You are a helpful Todo Assistant. User ID: {user_id}. You can manage tasks. Always confirm actions. If the user asks to 'complete' or 'delete' something but you don't know the ID, use 'list_tasks' first or ask them."},
            {"role": "user", "content": message}
        ]

        # First API call to determine tool usage
        try:
            response = await self._call_llm(messages, tools=self.tools, tool_choice="auto")
        except Exception as e:
            logger.error(f"AI API Error: {e}")
            return "I'm currently overloaded with requests (Rate Limit Exceeded). Please try again in a minute."

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            # Append the assistant's message with tool calls
            messages.append(response_message)

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                logger.info(f"Executing tool {function_name} with args {function_args} for user {user_id}")
                
                tool_response = "Error executing tool."
                
                try:
                    if function_name == "add_task":
                        tool_response = self._add_task(user_id, **function_args)
                    elif function_name == "list_tasks":
                        tool_response = self._get_tasks(user_id, **function_args)
                    elif function_name == "complete_task":
                        tool_response = self._complete_task(user_id, **function_args)
                    elif function_name == "delete_task":
                        tool_response = self._delete_task(user_id, **function_args)
                except Exception as e:
                    tool_response = f"Error: {str(e)}"

                # Append tool response
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": function_name,
                    "content": tool_response
                })

            # Second API call to generate final response
            try:
                second_response = await self._call_llm(messages)
                return second_response.choices[0].message.content
            except Exception as e:
                logger.error(f"AI API Error (Second Call): {e}")
                return "I processed your task, but I'm having trouble generating a confirmation message right now due to heavy traffic."
        
        else:
            return response_message.content

# Singleton
ai_service = AIService()
