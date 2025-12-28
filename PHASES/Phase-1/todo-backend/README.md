# Todo Backend Application

A command-line todo application that stores tasks in memory. This is Phase I of the Hackathon II project: The Evolution of Todo – Mastering Spec-Driven Development & Cloud Native AI.

## Features

- Add, delete, update, view, and mark tasks as complete
- In-memory storage (data is lost when application exits)
- Command-line interface for easy task management

## Requirements

- Python 3.13+
- UV package manager

## Installation

1. Clone the repository
2. Navigate to the `todo-backend` directory
3. Install dependencies with UV:

```bash
uv sync
```

## Usage

Run the application with various commands:

```bash
# Add a new task
python main.py add "Buy groceries" "Milk, eggs, bread"

# List all tasks
python main.py list

# Update a task
python main.py update 1 "Buy groceries and fruits" "Milk, eggs, bread, apples"

# Delete a task
python main.py delete 1

# Mark a task as complete
python main.py complete 2

# Show help
python main.py help

# Exit the application
python main.py exit
```

## Commands

- `add "title" "description"` - Add a new task
- `list` - View all tasks
- `update <id> "title" "description"` - Update a task
- `delete <id>` - Delete a task
- `complete <id>` - Mark task as complete
- `help` - Show available commands
- `exit` - Exit the application

## Architecture

This application follows a simple architecture with three main components:

1. **Task Model**: Represents a single todo task
2. **In-Memory Storage**: Handles storage and retrieval of tasks
3. **Task Manager**: Contains business logic for task operations
4. **Command Line Interface**: Handles user input/output

## Development

This project was created using the Spec-Driven Development approach with Claude Code and Spec-Kit Plus. All code is traceable to specifications in the `/specs` directory.

## Next Phases

- Phase II: Full-Stack Web Application with persistent storage
- Phase III: AI-Powered Chatbot Interface
- Phase IV: Kubernetes Deployment
- Phase V: Advanced Cloud Features with Kafka and Dapr