import sys
import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any


class Task:
    """Represents a single todo task with id, title, description, completion status, and creation timestamp."""

    def __init__(self, task_id: int, title: str, description: str = "", completed: bool = False, created_at_str: str = None):
        self.id = task_id
        self.title = title
        self.description = description
        self.completed = completed
        if created_at_str:
            self.created_at = datetime.fromisoformat(created_at_str)
        else:
            self.created_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the task to a dictionary for serialization."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat()
        }

    def __str__(self) -> str:
        """String representation of the task for display."""
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.id}. {self.title} - {self.description or 'No description'} (Created: {self.created_at.strftime('%Y-%m-%d %H:%M:%S')})"


class PersistentStorage:
    """Handles persistent storage of tasks using a JSON file to simulate in-memory behavior across commands."""

    def __init__(self, filename="tasks.json"):
        self.filename = filename
        self.tasks: List[Task] = []
        self.load_tasks()

    def load_tasks(self):
        """Load tasks from the JSON file."""
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    self.tasks = [Task(
                        task_data["id"],
                        task_data["title"],
                        task_data["description"],
                        task_data["completed"],
                        task_data["created_at"]
                    ) for task_data in data]
            except (json.JSONDecodeError, KeyError):
                self.tasks = []
        else:
            self.tasks = []

    def save_tasks(self):
        """Save tasks to the JSON file."""
        with open(self.filename, 'w') as f:
            json.dump([task.to_dict() for task in self.tasks], f, indent=2)

    def get_next_id(self) -> int:
        """Get the next available ID for a task."""
        if not self.tasks:
            return 1
        max_id = max(task.id for task in self.tasks)
        return max_id + 1

    def add_task(self, title: str, description: str = "") -> Task:
        """Add a new task to storage."""
        task_id = self.get_next_id()
        task = Task(task_id, title, description)
        self.tasks.append(task)
        self.save_tasks()
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by its ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def get_all_tasks(self) -> List[Task]:
        """Get all tasks."""
        return self.tasks.copy()

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> bool:
        """Update a task's title and/or description."""
        task = self.get_task(task_id)
        if task:
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            self.save_tasks()
            return True
        return False

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by its ID."""
        task = self.get_task(task_id)
        if task:
            self.tasks.remove(task)
            self.save_tasks()
            return True
        return False

    def complete_task(self, task_id: int) -> bool:
        """Mark a task as complete."""
        task = self.get_task(task_id)
        if task:
            task.completed = True
            self.save_tasks()
            return True
        return False


class TaskManager:
    """Handles all task operations and business logic."""

    def __init__(self):
        self.storage = PersistentStorage()
    
    def add_task(self, title: str, description: str = "") -> str:
        """Add a new task and return a confirmation message."""
        if not title.strip():
            return "Error: Task title cannot be empty."
        
        if len(title) > 200:
            return "Error: Task title cannot exceed 200 characters."
        
        if len(description) > 1000:
            return "Error: Task description cannot exceed 1000 characters."
        
        task = self.storage.add_task(title, description)
        return f"Task added successfully! ID: {task.id}, Title: {task.title}"
    
    def list_tasks(self) -> str:
        """List all tasks."""
        tasks = self.storage.get_all_tasks()
        if not tasks:
            return "No tasks found."
        
        task_list = "\n".join([str(task) for task in tasks])
        return f"Total tasks: {len(tasks)}\n{task_list}"
    
    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> str:
        """Update a task and return a confirmation message."""
        if title and len(title) > 200:
            return "Error: Task title cannot exceed 200 characters."
        
        if description and len(description) > 1000:
            return "Error: Task description cannot exceed 1000 characters."
        
        success = self.storage.update_task(task_id, title, description)
        if success:
            return f"Task {task_id} updated successfully!"
        else:
            return f"Error: Task with ID {task_id} not found."
    
    def delete_task(self, task_id: int) -> str:
        """Delete a task and return a confirmation message."""
        success = self.storage.delete_task(task_id)
        if success:
            return f"Task {task_id} deleted successfully!"
        else:
            return f"Error: Task with ID {task_id} not found."
    
    def complete_task(self, task_id: int) -> str:
        """Mark a task as complete and return a confirmation message."""
        success = self.storage.complete_task(task_id)
        if success:
            return f"Task {task_id} marked as complete!"
        else:
            return f"Error: Task with ID {task_id} not found."


class InteractiveCLI:
    """Handles interactive user interface with arrow key navigation."""

    def __init__(self):
        self.task_manager = TaskManager()

    def display_menu(self):
        """Display the main menu."""
        print("\n" + "="*50)
        print("TODO APPLICATION - INTERACTIVE MODE")
        print("="*50)
        print("Use number keys to select options")
        print("Press Ctrl+C to quit at any time")
        print("-"*50)
        print("1. View All Tasks")
        print("2. Add New Task")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Mark Task Complete")
        print("6. Help")
        print("7. Exit")
        print("-"*50)

        # Show current task count
        tasks = self.task_manager.storage.get_all_tasks()
        print(f"Current tasks: {len(tasks)}")
        print("="*50)

    def view_tasks(self):
        """Display all tasks."""
        result = self.task_manager.list_tasks()
        print(f"\n{result}")
        input("\nPress Enter to continue...")

    def add_task_interactive(self):
        """Interactive task addition."""
        print("\n--- ADD NEW TASK ---")
        try:
            title = input("Enter task title: ").strip()
            if not title:
                print("Task title cannot be empty!")
                input("Press Enter to continue...")
                return

            description = input("Enter task description (optional): ").strip()

            result = self.task_manager.add_task(title, description)
            print(f"\n{result}")
            input("Press Enter to continue...")
        except KeyboardInterrupt:
            print("\nOperation cancelled.")
            input("Press Enter to continue...")

    def select_task(self, operation: str):
        """Allow user to select a task from the list."""
        tasks = self.task_manager.storage.get_all_tasks()

        if not tasks:
            print("\nNo tasks available!")
            input("Press Enter to continue...")
            return None

        print(f"\n--- SELECT TASK TO {operation.upper()} ---")
        print("Available tasks:\n")

        for i, task in enumerate(tasks):
            status = "✓" if task.completed else "○"
            print(f"{i+1}. [{status}] {task.id}. {task.title}")

        print(f"\n0. Cancel")

        try:
            choice = int(input(f"\nSelect task (1-{len(tasks)}), or 0 to cancel: "))
            if choice == 0:
                return None
            elif 1 <= choice <= len(tasks):
                return tasks[choice - 1]
            else:
                print("Invalid selection!")
                input("Press Enter to continue...")
                return None
        except ValueError:
            print("Please enter a valid number!")
            input("Press Enter to continue...")
            return None

    def update_task_interactive(self):
        """Interactive task update."""
        task = self.select_task("UPDATE")
        if not task:
            return

        print(f"\nUpdating task: {task.title}")
        new_title = input(f"Enter new title (current: '{task.title}'): ").strip()
        new_description = input(f"Enter new description (current: '{task.description}'): ").strip()

        # Use current values if user doesn't provide new ones
        if not new_title:
            new_title = task.title
        if not new_description:
            new_description = task.description

        result = self.task_manager.update_task(task.id, new_title, new_description)
        print(f"\n{result}")
        input("Press Enter to continue...")

    def delete_task_interactive(self):
        """Interactive task deletion."""
        task = self.select_task("DELETE")
        if not task:
            return

        confirm_delete = input(f"Are you sure you want to delete task '{task.title}'? (y/N): ").strip().lower()
        if confirm_delete in ['y', 'yes', '1']:
            result = self.task_manager.delete_task(task.id)
            print(f"\n{result}")
        else:
            print("Deletion cancelled.")

        input("Press Enter to continue...")

    def complete_task_interactive(self):
        """Interactive task completion."""
        task = self.select_task("COMPLETE")
        if not task:
            return

        result = self.task_manager.complete_task(task.id)
        print(f"\n{result}")
        input("Press Enter to continue...")

    def show_help(self):
        """Display help information."""
        help_text = """
TODO APP - HELP

This interactive application allows you to manage your tasks.

MAIN MENU OPTIONS:
1. View All Tasks - Display all your tasks with their status
2. Add New Task - Create a new task with title and description
3. Update Task - Select and modify an existing task
4. Delete Task - Select and remove a task
5. Mark Task Complete - Select a task and mark it as completed
6. Help - Show this help message
7. Exit - Quit the application

TASK STATUS:
- ○ = Pending (not completed)
- ✓ = Completed

NAVIGATION:
- Use number keys to select menu options
- Follow prompts for each operation
- Press Ctrl+C to quit at any time
        """
        print(help_text)
        input("Press Enter to continue...")

    def run_interactive(self):
        """Run the interactive CLI."""
        while True:
            # Clear screen (simple approach)
            print("\033[2J\033[H")  # ANSI escape codes to clear screen
            self.display_menu()

            try:
                choice = input("\nEnter your choice (1-7): ").strip()

                if choice == '1':
                    self.view_tasks()
                elif choice == '2':
                    self.add_task_interactive()
                elif choice == '3':
                    self.update_task_interactive()
                elif choice == '4':
                    self.delete_task_interactive()
                elif choice == '5':
                    self.complete_task_interactive()
                elif choice == '6':
                    self.show_help()
                elif choice == '7':
                    print("\nThank you for using the Todo App!")
                    break
                else:
                    print("\nInvalid choice. Please enter a number between 1-7.")
                    input("Press Enter to continue...")
            except KeyboardInterrupt:
                print("\n\nThank you for using the Todo App!")
                break


class CommandLineInterface:
    """Handles user input/output for the console application."""

    def __init__(self):
        self.task_manager = TaskManager()

    def display_help(self) -> str:
        """Display help information."""
        help_text = """
Todo App - Available Commands:
  add "title" "description"     - Add a new task
  list                         - View all tasks
  update <id> "title" "desc"   - Update a task (title and/or description)
  delete <id>                  - Delete a task
  complete <id>                - Mark task as complete
  help                         - Show this help message
  exit                         - Exit the application

Examples:
  add "Buy groceries" "Milk, eggs, bread"
  list
  update 1 "Buy groceries and fruits" "Milk, eggs, bread, apples"
  delete 1
  complete 2
        """
        return help_text

    def parse_command(self, args: List[str]) -> str:
        """Parse and execute user commands."""
        if not args:
            return self.display_help()

        command = args[0].lower()

        if command == "help":
            return self.display_help()
        elif command == "list":
            return self.task_manager.list_tasks()
        elif command == "add":
            if len(args) < 2:
                return "Error: Please provide a title for the task."
            title = args[1] if len(args) > 1 else ""
            description = args[2] if len(args) > 2 else ""
            return self.task_manager.add_task(title, description)
        elif command == "update":
            if len(args) < 3:
                return "Error: Please provide task ID and at least one field to update."
            try:
                task_id = int(args[1])
                title = args[2] if len(args) > 2 and args[2] != '""' else None
                description = args[3] if len(args) > 3 and args[3] != '""' else None
                return self.task_manager.update_task(task_id, title, description)
            except ValueError:
                return "Error: Task ID must be a number."
        elif command == "delete":
            if len(args) < 2:
                return "Error: Please provide a task ID."
            try:
                task_id = int(args[1])
                return self.task_manager.delete_task(task_id)
            except ValueError:
                return "Error: Task ID must be a number."
        elif command == "complete":
            if len(args) < 2:
                return "Error: Please provide a task ID."
            try:
                task_id = int(args[1])
                return self.task_manager.complete_task(task_id)
            except ValueError:
                return "Error: Task ID must be a number."
        elif command == "exit":
            sys.exit(0)
        else:
            return f"Error: Unknown command '{command}'. Type 'help' for available commands."

    def run(self, args: List[str] = None):
        """Run the command line interface."""
        if args is None:
            args = sys.argv[1:]

        if not args:
            # If no arguments provided, run the interactive mode
            print("Starting interactive mode...")
            interactive_cli = InteractiveCLI()
            interactive_cli.run_interactive()
            return

        result = self.parse_command(args)
        print(result)


def main():
    """Main entry point for the application."""
    cli = CommandLineInterface()
    cli.run()


if __name__ == "__main__":
    main()