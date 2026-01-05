from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ..core.security import get_current_user_id
import os
from uuid import uuid4
from datetime import datetime
import json
import logging
from openai import AsyncOpenAI
from ..services.mcp_integration import MCPTodoService
from ..services.category_detector import category_detector_service
from ..services.priority_analyzer import priority_analyzer_service

router = APIRouter(prefix="/api/ai", tags=["ai-chat"])

# Set up logging
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    tool_calls: Optional[List[Dict[str, Any]]] = []

# Initialize OpenAI client
openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    timeout=30.0,
)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Chat endpoint that connects to AI agent via MCP tools.
    This endpoint will process user messages and use AI to decide which MCP tools to call.
    """
    # Create a new session ID if not provided
    session_id = request.session_id or str(uuid4())

    try:
        # Define the tools that map to MCP server functions
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task to the user's task list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user ID"},
                            "title": {"type": "string", "description": "The task title"},
                            "description": {"type": "string", "description": "Optional task description"},
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
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List all tasks for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user ID"},
                            "status": {"type": "string", "enum": ["all", "active", "completed"], "default": "all"},
                            "priority": {"type": "string", "enum": ["all", "low", "medium", "high"], "default": "all"},
                            "category": {"type": "string", "default": "all"}
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user ID"},
                            "task_id": {"type": "integer", "description": "The ID of the task to complete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task from the user's list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user ID"},
                            "task_id": {"type": "integer", "description": "The ID of the task to delete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update an existing task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The user ID"},
                            "task_id": {"type": "integer", "description": "The ID of the task to update"},
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
                }
            }
        ]

        # Create messages for the AI
        messages = [
            {
                "role": "system",
                "content": f"""
                You are an AI assistant that helps users manage their tasks.
                You can add, list, update, complete, and delete tasks using the provided tools.
                The current user ID is {current_user_id}.
                Always use the user ID {current_user_id} when calling tools.
                Be helpful, friendly, and provide clear responses to the user.
                If the user wants to perform task operations, use the appropriate tools.
                If the user asks general questions, provide helpful responses without using tools.

                When adding tasks, try to determine an appropriate category from these options:
                work, personal, health, finance, education, shopping, home, travel, entertainment, meeting, appointment, reminder, other.
                If the user doesn't specify a category, use the content of the task to suggest one.
                For due dates and reminders, accept natural language like 'tomorrow', 'next Monday', 'in 2 hours', etc.
                """
            },
            {
                "role": "user",
                "content": request.message
            }
        ]

        # Call the OpenAI API with tools
        response = await openai_client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        # Extract the response
        choice = response.choices[0]
        message = choice.message

        # Process tool calls if any
        processed_tool_calls = []
        response_content = message.content or "I processed your request successfully."

        if message.tool_calls:
            # Execute each tool call via the MCP integration service
            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Add the user_id if not present
                if "user_id" not in arguments:
                    arguments["user_id"] = current_user_id

                # Execute the tool via the MCP integration service
                try:
                    tool_result = await MCPTodoService.execute_tool(tool_name, arguments)

                    # Format the tool result for the response
                    tool_result_formatted = {
                        "id": tool_call.id,
                        "type": tool_call.type,
                        "function": {
                            "name": tool_name,
                            "arguments": json.dumps(arguments),
                            "result": tool_result
                        }
                    }
                    processed_tool_calls.append(tool_result_formatted)

                    # Log successful tool execution
                    logger.info(f"Successfully executed tool {tool_name} for user {current_user_id}")
                except Exception as e:
                    logger.error(f"Error executing tool {tool_name} for user {current_user_id}: {str(e)}", exc_info=True)
                    tool_result_formatted = {
                        "id": tool_call.id,
                        "type": tool_call.type,
                        "function": {
                            "name": tool_name,
                            "arguments": json.dumps(arguments),
                            "error": f"Failed to execute tool: {str(e)}"
                        }
                    }
                    processed_tool_calls.append(tool_result_formatted)

            # Now call the AI again with the tool results to get a final response
            if processed_tool_calls:
                # Create a follow-up request with tool results
                follow_up_messages = [
                    {
                        "role": "system",
                        "content": f"""
                        You are an AI assistant that helps users manage their tasks.
                        The tools you requested have been executed. Here are the results:
                        """
                    },
                    {
                        "role": "user",
                        "content": request.message
                    }
                ]

                # Add tool results as assistant messages
                for tool_call in message.tool_calls:
                    tool_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)

                    if "user_id" not in arguments:
                        arguments["user_id"] = current_user_id

                    # Add the tool call and result to the conversation
                    follow_up_messages.append({
                        "role": "assistant",
                        "content": f"Called tool '{tool_name}' with arguments: {json.dumps(arguments)}"
                    })

                # Add the tool results
                for processed_tool_call in processed_tool_calls:
                    tool_result = processed_tool_call["function"].get("result") or processed_tool_call["function"].get("error")
                    follow_up_messages.append({
                        "role": "function",
                        "name": processed_tool_call["function"]["name"],
                        "content": json.dumps(tool_result)
                    })

                # Get final response from AI with tool results
                final_response = await openai_client.chat.completions.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
                    messages=follow_up_messages
                )

                response_content = final_response.choices[0].message.content or "I processed your request successfully."

        return ChatResponse(
            response=response_content,
            session_id=session_id,
            tool_calls=processed_tool_calls
        )
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return ChatResponse(
            response=f"I encountered an error processing your request: {str(e)}. Please try again.",
            session_id=session_id,
            tool_calls=[]
        )

# Additional endpoints for chat history and session management
@router.get("/chat/history/{session_id}")
async def get_chat_history(
    session_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve chat history for a specific session.
    """
    # In a real implementation, this would fetch from the database
    # For now, return a simulated response
    return {
        "session_id": session_id,
        "messages": [],
        "created_at": datetime.now().isoformat()
    }