import asyncio
import os
import sys
from datetime import datetime

# Add the backend directory to the path so we can import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'todo-backend'))

# Mock the environment to load settings correctly if needed
os.environ["DATABASE_URL"] = "sqlite:///todo.db" 
os.environ["BETTER_AUTH_SECRET"] = "dummy-secret"

# We need to test the updated add_task logic in main.py.
# Since main.py runs a FastAPI app, we can try to import the components directly
# or mock the necessary parts.
# Importing main might start the app or fail if dependencies are missing, but let's try importing 
# just the TaskManager and DatabaseStorage if possible, or replicate the logic.
# However, the key logic change is in `ask_ai_help`'s internal `add_task` wrapper and `generate_ai_help_response`.

from src.models.models import Task
from src.main import task_manager, generate_ai_help_response

# We can't easily test the `ask_ai_help` endpoint directly without a running server or TestClient.
# But we can test `generate_ai_help_response` with the updated tool signature.

async def test_ai_interaction():
    print("Testing AI Interaction for New Features...")
    
    # Define a mock add_task that mimics the one in ask_ai_help
    def add_task_mock(title: str, description: str = "", priority: str = "medium", category: str = "other", due_date: str = "", parent_id: int = None, attachments: str = "[]") -> str:
        """
        Adds a new task to the user's todo list.
        
        Args:
            title: The short name of the task.
            description: Optional details.
            priority: 'low', 'medium', or 'high'.
            category: 'work', 'personal', etc.
            due_date: Natural language string (e.g., 'tomorrow', 'next friday').
            parent_id: Optional ID of a parent task if this is a subtask.
            attachments: JSON string list of file URLs.
        """
        print(f"TOOL CALLED: add_task(title='{title}', due_date='{due_date}', parent_id={parent_id}, attachments='{attachments}')")
        return f"Successfully added task: '{title}'"

    add_task_mock.name = "add_task"

    # Test 1: User gives full info
    print("\n--- Test 1: Full Info ---")
    prompt = "Add a task 'Finish Report' due tomorrow with high priority and attach http://example.com/doc.pdf"
    print(f"User: {prompt}")
    # We are testing if the AI correctly extracts the new parameters (attachments, due_date)
    # Note: We need a valid GEMINI_API_KEY for this to actually hit the model and parse.
    # If no key, it might fail or return error. assuming env has it.
    
    try:
        response = await generate_ai_help_response(prompt, tools=[add_task_mock])
        print(f"AI: {response}")
    except Exception as e:
        print(f"Error: {e}")

    # Test 2: User gives partial info (should ask for more or infer)
    print("\n--- Test 2: Partial Info (Ambiguous) ---")
    prompt = "I need to buy something."
    print(f"User: {prompt}")
    try:
        response = await generate_ai_help_response(prompt, tools=[add_task_mock])
        print(f"AI: {response}")
    except Exception as e:
        print(f"Error: {e}")

async def main():
    await test_ai_interaction()

if __name__ == "__main__":
    asyncio.run(main())
