# Todo App - Hackathon II: The Evolution of Todo

## Project Overview
This is a Todo Console Application built as part of Hackathon II: The Evolution of Todo – Mastering Spec-Driven Development & Cloud Native AI. This is Phase I: In-Memory Python Console App.

## Spec-Kit Structure
Specifications are organized in /specs:
- /specs/overview.md - Project overview
- /specs/features/ - Feature specs (what to build)
- /specs/api/ - API specifications
- /specs/database/ - Database specifications (for future phases)
- /specs/ui/ - UI specifications (for future phases)

## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: @specs/001-todo-app-backend/spec.md
3. Update specs if requirements change

## Project Structure
- /todo-backend - Python console application
- /specs - Specification files for spec-driven development
- /history - Historical plan documentation

## Development Workflow
1. Read spec: @specs/001-todo-app-backend/spec.md
2. Follow plan: @specs/001-todo-app-backend/plan.md
3. Execute tasks: @specs/001-todo-app-backend/tasks.md
4. Implement following SDD lifecycle: Specify → Plan → Tasks → Implement

## Commands
- Run app: cd todo-backend && python main.py [command]
- Add task: python main.py add "title" "description"
- List tasks: python main.py list
- Update task: python main.py update [id] "title" "description"
- Delete task: python main.py delete [id]
- Complete task: python main.py complete [id]

## Phase I Requirements
- Implement all 5 Basic Level features (Add, Delete, Update, View, Mark Complete)
- Use spec-driven development with Claude Code and Spec-Kit Plus
- Follow clean code principles and proper Python project structure
- Store tasks in memory (Phase I requirement)