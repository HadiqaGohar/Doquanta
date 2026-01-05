import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from mcp.server import Server
from mcp.types import Tool, TextContent
from sqlmodel import Session, select
from src.models.models import Task
from src.db.session import engine
from datetime import datetime
from src.services.date_time_parser import date_time_parser_service

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize MCP Server
mcp_server = Server("todo-mcp-server")

@mcp_server.list_tools()
def list_tools() -> List[Tool]:
    """
    List available MCP tools for todo operations.
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
                    "description": {"type": "string", "description": "Task description (optional)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
                    "category": {"type": "string", "default": "other"},
                    "due_date": {"type": "string", "description": "Due date in ISO format or natural language (e.g., 'tomorrow', 'next Monday')"},
                    "reminder_time": {"type": "string", "description": "Reminder time in ISO format or natural language"},
                    "is_recurring": {"type": "boolean", "description": "Whether the task is recurring"},
                    "recurrence_pattern": {"type": "string", "enum": ["daily", "weekly", "monthly", "yearly"], "description": "Pattern for recurring tasks"},
                    "recurrence_interval": {"type": "integer", "description": "Interval for recurring tasks (e.g., every 2 weeks)"},
                    "recurrence_end_date": {"type": "string", "description": "End date for recurring tasks in ISO format or natural language"}
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
                    "status": {"type": "string", "enum": ["all", "active", "completed"], "default": "all"},
                    "priority": {"type": "string", "enum": ["all", "low", "medium", "high"], "default": "all"},
                    "category": {"type": "string", "default": "all"}
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
            description="Modify task title, description or other details",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "User ID"},
                    "task_id": {"type": "integer", "description": "Task ID"},
                    "title": {"type": "string", "description": "New task title (optional)"},
                    "description": {"type": "string", "description": "New task description (optional)"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "category": {"type": "string"},
                    "completed": {"type": "boolean"},
                    "due_date": {"type": "string", "description": "New due date in ISO format or natural language"},
                    "reminder_time": {"type": "string", "description": "New reminder time in ISO format or natural language"},
                    "is_recurring": {"type": "boolean", "description": "Whether the task is recurring"},
                    "recurrence_pattern": {"type": "string", "enum": ["daily", "weekly", "monthly", "yearly"], "description": "Pattern for recurring tasks"},
                    "recurrence_interval": {"type": "integer", "description": "Interval for recurring tasks"},
                    "recurrence_end_date": {"type": "string", "description": "End date for recurring tasks in ISO format or natural language"}
                },
                "required": ["user_id", "task_id"]
            }
        )
    ]

@mcp_server.call_tool()
async def call_tool(tool_name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """
    Execute MCP tool calls for todo operations.
    """
    user_id = arguments.get("user_id")

    if not user_id:
        error_result = {"error": "Missing user_id in arguments"}
        logger.error(f"Missing user_id in tool call: {tool_name}")
        return [TextContent(type="text", text=json.dumps(error_result))]

    try:
        with Session(engine) as session:
            if tool_name == "add_task":
                title = arguments.get("title")
                description = arguments.get("description", "")
                priority = arguments.get("priority", "medium")
                category = arguments.get("category", "other")

                # Handle time/date parameters
                due_date_raw = arguments.get("due_date")
                reminder_time_raw = arguments.get("reminder_time")
                is_recurring = arguments.get("is_recurring", False)
                recurrence_pattern = arguments.get("recurrence_pattern")
                recurrence_interval = arguments.get("recurrence_interval")
                recurrence_end_date_raw = arguments.get("recurrence_end_date")

                # Parse date/time values
                due_date = None
                if due_date_raw:
                    due_date = date_time_parser_service.parse_datetime(due_date_raw)

                reminder_time = None
                if reminder_time_raw:
                    reminder_time = date_time_parser_service.parse_datetime(reminder_time_raw)

                recurrence_end_date = None
                if recurrence_end_date_raw:
                    recurrence_end_date = date_time_parser_service.parse_datetime(recurrence_end_date_raw)

                if not title:
                    result = {"error": "Missing required 'title' parameter"}
                else:
                    # Create new task
                    db_task = Task(
                        user_id=user_id,
                        title=title,
                        description=description,
                        priority=priority,
                        category=category,
                        due_date=due_date,
                        reminder_time=reminder_time,
                        is_recurring=is_recurring,
                        recurrence_pattern=recurrence_pattern,
                        recurrence_interval=recurrence_interval,
                        recurrence_end_date=recurrence_end_date,
                        created_at=datetime.now()
                    )
                    session.add(db_task)
                    session.commit()
                    session.refresh(db_task)

                    result = {
                        "task_id": db_task.id,
                        "status": "created",
                        "title": db_task.title,
                        "message": f"Task '{db_task.title}' has been created successfully!"
                    }

            elif tool_name == "list_tasks":
                status = arguments.get("status", "all")
                priority = arguments.get("priority", "all")
                category = arguments.get("category", "all")

                # Build query with filters
                query = select(Task).where(Task.user_id == user_id)

                if status == "active":
                    query = query.where(Task.completed == False)
                elif status == "completed":
                    query = query.where(Task.completed == True)

                if priority != "all":
                    query = query.where(Task.priority == priority)

                if category != "all":
                    query = query.where(Task.category == category)

                tasks = session.exec(query).all()

                result = {
                    "tasks": [
                        {
                            "id": task.id,
                            "title": task.title,
                            "completed": task.completed,
                            "priority": task.priority,
                            "category": task.category,
                            "description": task.description
                        }
                        for task in tasks
                    ],
                    "count": len(tasks),
                    "message": f"Found {len(tasks)} tasks matching your criteria."
                }

            elif tool_name == "complete_task":
                task_id = arguments.get("task_id")

                if not task_id:
                    result = {"error": "Missing required 'task_id' parameter"}
                else:
                    db_task = session.get(Task, task_id)

                    if not db_task or db_task.user_id != user_id:
                        result = {"error": "Task not found or unauthorized"}
                    else:
                        db_task.completed = True
                        db_task.updated_at = datetime.now()
                        session.add(db_task)
                        session.commit()

                        result = {
                            "task_id": db_task.id,
                            "status": "completed",
                            "title": db_task.title,
                            "message": f"Task '{db_task.title}' has been marked as complete!"
                        }

            elif tool_name == "delete_task":
                task_id = arguments.get("task_id")

                if not task_id:
                    result = {"error": "Missing required 'task_id' parameter"}
                else:
                    db_task = session.get(Task, task_id)

                    if not db_task or db_task.user_id != user_id:
                        result = {"error": "Task not found or unauthorized"}
                    else:
                        session.delete(db_task)
                        session.commit()

                        result = {
                            "task_id": task_id,
                            "status": "deleted",
                            "title": db_task.title,
                            "message": f"Task '{db_task.title}' has been deleted successfully!"
                        }

            elif tool_name == "update_task":
                task_id = arguments.get("task_id")

                if not task_id:
                    result = {"error": "Missing required 'task_id' parameter"}
                else:
                    db_task = session.get(Task, task_id)

                    if not db_task or db_task.user_id != user_id:
                        result = {"error": "Task not found or unauthorized"}
                    else:
                        # Update fields if provided
                        update_fields = ["title", "description", "priority", "category", "completed"]
                        for field in update_fields:
                            value = arguments.get(field)
                            if value is not None:
                                setattr(db_task, field, value)

                        # Handle time/date parameters
                        due_date_raw = arguments.get("due_date")
                        reminder_time_raw = arguments.get("reminder_time")
                        is_recurring = arguments.get("is_recurring")
                        recurrence_pattern = arguments.get("recurrence_pattern")
                        recurrence_interval = arguments.get("recurrence_interval")
                        recurrence_end_date_raw = arguments.get("recurrence_end_date")

                        # Parse and update date/time values
                        if due_date_raw is not None:
                            due_date = date_time_parser_service.parse_datetime(due_date_raw)
                            db_task.due_date = due_date

                        if reminder_time_raw is not None:
                            reminder_time = date_time_parser_service.parse_datetime(reminder_time_raw)
                            db_task.reminder_time = reminder_time

                        if is_recurring is not None:
                            db_task.is_recurring = is_recurring

                        if recurrence_pattern is not None:
                            db_task.recurrence_pattern = recurrence_pattern

                        if recurrence_interval is not None:
                            db_task.recurrence_interval = recurrence_interval

                        if recurrence_end_date_raw is not None:
                            recurrence_end_date = date_time_parser_service.parse_datetime(recurrence_end_date_raw)
                            db_task.recurrence_end_date = recurrence_end_date

                        db_task.updated_at = datetime.now()
                        session.add(db_task)
                        session.commit()

                        result = {
                            "task_id": db_task.id,
                            "status": "updated",
                            "title": db_task.title,
                            "message": f"Task '{db_task.title}' has been updated successfully!"
                        }
            else:
                result = {"error": f"Unknown tool: {tool_name}"}

        logger.info(f"MCP tool '{tool_name}' executed successfully for user {user_id}")
        return [TextContent(type="text", text=json.dumps(result))]

    except Exception as e:
        logger.error(f"Error executing MCP tool '{tool_name}': {str(e)}")
        error_result = {"error": f"Error executing tool: {str(e)}"}
        return [TextContent(type="text", text=json.dumps(error_result))]

# Run the MCP server
async def run_mcp_server():
    """
    Run the MCP server for AI agent integration.
    """
    logger.info("Starting MCP server...")
    async with mcp_server.serve_stdio():
        await asyncio.Future()  # Run forever