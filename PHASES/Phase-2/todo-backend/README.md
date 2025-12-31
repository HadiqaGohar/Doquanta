# Todo Backend Application

A full-stack todo application with persistent storage using PostgreSQL. This is Phase II of the Hackathon II project: The Evolution of Todo – Mastering Spec-Driven Development & Cloud Native AI.

## Features

- Add, delete, update, view, and mark tasks as complete
- Persistent storage using PostgreSQL database
- RESTful API endpoints
- JWT-based authentication with Better Auth
- Multi-user support with data isolation

## Requirements

- Python 3.13+
- UV package manager
- Docker and Docker Compose
- PostgreSQL (managed via Docker)

## Installation

1. Clone the repository
2. Navigate to the `todo-backend` directory
3. Set up the database using Docker Compose:

```bash
# Start the PostgreSQL database container
docker compose up -d db
```

4. Install dependencies with UV:

```bash
uv sync
```

5. Set up environment variables by creating a `.env` file based on `.env.example`:

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

## Usage

### Running the API Server

```bash
# Start the database (if not already running)
docker compose up -d db

# Run the FastAPI application
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### API Endpoints

- `GET /` - Health check endpoint
- `GET /api/{user_id}/tasks` - Get all tasks for a user
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Mark task as complete

### Command Line Usage (for development/testing)

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

## Architecture

This application follows a layered architecture with the following components:

1. **Task Model**: Represents a single todo task using SQLModel
2. **Database Storage**: Handles persistent storage using PostgreSQL
3. **Task Manager**: Contains business logic for task operations
4. **FastAPI Endpoints**: RESTful API for web application
5. **Command Line Interface**: For development and testing

## Development

This project was created using the Spec-Driven Development approach with Claude Code and Spec-Kit Plus. All code is traceable to specifications in the `/specs` directory.

## Database Management

The application uses Docker Compose to manage the PostgreSQL database:

```bash
# Start the database
docker compose up -d db

# Stop the database
docker compose down

# View database logs
docker compose logs db

# Connect to the database container
docker compose exec db psql -U user -d todo
```

## Next Phases

- Phase III: AI-Powered Chatbot Interface
- Phase IV: Kubernetes Deployment
- Phase V: Advanced Cloud Features with Kafka and Dapr