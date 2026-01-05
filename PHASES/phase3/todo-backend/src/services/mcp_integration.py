"""
MCP (Model Context Protocol) Integration Service
This module provides functions to execute MCP tools for todo operations.
"""
import json
import logging
from typing import Dict, Any, Optional
from sqlmodel import Session
from ..models.models import Task
from ..db.session import engine
from ..chatbot.mcp_server import call_tool

logger = logging.getLogger(__name__)

class MCPTodoService:
    """
    Service class to handle MCP tool execution for todo operations.
    """

    @staticmethod
    async def execute_add_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the add_task MCP tool.
        """
        try:
            # Input validation
            user_id = arguments.get("user_id")
            title = arguments.get("title")

            if not user_id:
                return {"error": "Missing required 'user_id' parameter"}

            if not title or not title.strip():
                return {"error": "Missing required 'title' parameter"}

            # Prepare arguments for MCP tool call
            tool_arguments = {
                "user_id": user_id,
                "title": title.strip(),
                "description": arguments.get("description", ""),
                "priority": arguments.get("priority", "medium"),
                "category": arguments.get("category", "other"),
                "due_date": arguments.get("due_date"),
                "reminder_time": arguments.get("reminder_time"),
                "is_recurring": arguments.get("is_recurring"),
                "recurrence_pattern": arguments.get("recurrence_pattern"),
                "recurrence_interval": arguments.get("recurrence_interval"),
                "recurrence_end_date": arguments.get("recurrence_end_date")
            }

            # Sanitize inputs
            if tool_arguments["description"] is None:
                tool_arguments["description"] = ""
            if tool_arguments["priority"] not in ["low", "medium", "high"]:
                tool_arguments["priority"] = "medium"
            if tool_arguments["is_recurring"] is not None and not isinstance(tool_arguments["is_recurring"], bool):
                tool_arguments["is_recurring"] = bool(tool_arguments["is_recurring"])

            # Execute the MCP tool
            result = await call_tool("add_task", tool_arguments)

            # Parse and return the result
            if result and len(result) > 0:
                content = result[0].text
                parsed_result = json.loads(content)
                return parsed_result
            else:
                return {"error": "No result returned from MCP tool"}

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response from add_task: {str(e)}")
            return {"error": f"Invalid response format from add_task: {str(e)}"}
        except Exception as e:
            logger.error(f"Error executing add_task: {str(e)}", exc_info=True)
            return {"error": f"Failed to add task: {str(e)}"}

    @staticmethod
    async def execute_list_tasks(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the list_tasks MCP tool.
        """
        try:
            # Input validation
            user_id = arguments.get("user_id")
            if not user_id:
                return {"error": "Missing required 'user_id' parameter"}

            # Prepare arguments for MCP tool call
            tool_arguments = {
                "user_id": user_id,
                "status": arguments.get("status", "all"),
                "priority": arguments.get("priority", "all"),
                "category": arguments.get("category", "all")
            }

            # Sanitize inputs
            valid_statuses = ["all", "active", "completed"]
            if tool_arguments["status"] not in valid_statuses:
                tool_arguments["status"] = "all"

            valid_priorities = ["all", "low", "medium", "high"]
            if tool_arguments["priority"] not in valid_priorities:
                tool_arguments["priority"] = "all"

            # Execute the MCP tool
            result = await call_tool("list_tasks", tool_arguments)

            # Parse and return the result
            if result and len(result) > 0:
                content = result[0].text
                parsed_result = json.loads(content)
                return parsed_result
            else:
                return {"error": "No result returned from MCP tool"}

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response from list_tasks: {str(e)}")
            return {"error": f"Invalid response format from list_tasks: {str(e)}"}
        except Exception as e:
            logger.error(f"Error executing list_tasks: {str(e)}", exc_info=True)
            return {"error": f"Failed to list tasks: {str(e)}"}

    @staticmethod
    async def execute_complete_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the complete_task MCP tool.
        """
        try:
            # Prepare arguments for MCP tool call
            tool_arguments = {
                "user_id": arguments.get("user_id"),
                "task_id": arguments.get("task_id")
            }

            # Execute the MCP tool
            result = await call_tool("complete_task", tool_arguments)

            # Parse and return the result
            if result and len(result) > 0:
                content = result[0].text
                return json.loads(content)
            else:
                return {"error": "No result returned from MCP tool"}

        except Exception as e:
            logger.error(f"Error executing complete_task: {str(e)}")
            return {"error": f"Failed to complete task: {str(e)}"}

    @staticmethod
    async def execute_delete_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the delete_task MCP tool.
        """
        try:
            # Prepare arguments for MCP tool call
            tool_arguments = {
                "user_id": arguments.get("user_id"),
                "task_id": arguments.get("task_id")
            }

            # Execute the MCP tool
            result = await call_tool("delete_task", tool_arguments)

            # Parse and return the result
            if result and len(result) > 0:
                content = result[0].text
                return json.loads(content)
            else:
                return {"error": "No result returned from MCP tool"}

        except Exception as e:
            logger.error(f"Error executing delete_task: {str(e)}")
            return {"error": f"Failed to delete task: {str(e)}"}

    @staticmethod
    async def execute_update_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the update_task MCP tool.
        """
        try:
            # Prepare arguments for MCP tool call
            tool_arguments = {
                "user_id": arguments.get("user_id"),
                "task_id": arguments.get("task_id"),
                "title": arguments.get("title"),
                "description": arguments.get("description"),
                "priority": arguments.get("priority"),
                "category": arguments.get("category"),
                "completed": arguments.get("completed"),
                "due_date": arguments.get("due_date"),
                "reminder_time": arguments.get("reminder_time"),
                "is_recurring": arguments.get("is_recurring"),
                "recurrence_pattern": arguments.get("recurrence_pattern"),
                "recurrence_interval": arguments.get("recurrence_interval"),
                "recurrence_end_date": arguments.get("recurrence_end_date")
            }

            # Filter out None values to avoid overwriting with None
            tool_arguments = {k: v for k, v in tool_arguments.items() if v is not None}

            # Execute the MCP tool
            result = await call_tool("update_task", tool_arguments)

            # Parse and return the result
            if result and len(result) > 0:
                content = result[0].text
                return json.loads(content)
            else:
                return {"error": "No result returned from MCP tool"}

        except Exception as e:
            logger.error(f"Error executing update_task: {str(e)}")
            return {"error": f"Failed to update task: {str(e)}"}

    @staticmethod
    async def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an MCP tool based on its name.
        """
        tool_mapping = {
            "add_task": MCPTodoService.execute_add_task,
            "list_tasks": MCPTodoService.execute_list_tasks,
            "complete_task": MCPTodoService.execute_complete_task,
            "delete_task": MCPTodoService.execute_delete_task,
            "update_task": MCPTodoService.execute_update_task
        }

        if tool_name not in tool_mapping:
            return {"error": f"Unknown tool: {tool_name}"}

        executor = tool_mapping[tool_name]
        return await executor(arguments)