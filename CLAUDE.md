# Todo App - Hackathon II: The Evolution of Todo

## Project Overview
This project, "The Evolution of Todo," is a comprehensive journey from a simple CLI to a cloud-native, AI-powered system.

## Spec-Kit Structure
Specifications are organized in `/specs`:
- `/specs/001-phase-1/` - In-Memory Python Console App
- `/specs/002-phase-2/` - Full-Stack Web Application

## How to Use Specs
1. Always read relevant spec before implementing.
2. Reference current phase specs: e.g., `@specs/002-phase-2/spec.md`.
3. Update specs if requirements change.

## Monorepo Structure
- `/backend` - Python FastAPI REST API.
- `/frontend` - Next.js 16+ Web Application.
- `/specs` - Specification files for spec-driven development.

## Development Workflow
1. **Specify**: Define requirements in `spec.md`.
2. **Plan**: Outline architecture and steps in `plan.md`.
3. **Tasks**: Break down implementation in `tasks.md`.
4. **Implement**: Execute code changes based on tasks, strictly following "No Manual Coding".

## Backend Commands (Python/FastAPI)
- Start server: `cd backend && uvicorn src.main:app --reload`
- Install dependencies: `cd backend && uv sync`
- Run tests: `cd backend && pytest`

## Frontend Commands (Next.js)
- Start development: `cd frontend && npm run dev`
- Install dependencies: `cd frontend && npm install`
- Build: `cd frontend && npm run build`

## Phase II Requirements
- Full-Stack Web App with Next.js & FastAPI.
- Persistent storage using Neon Serverless PostgreSQL.
- Authentication using Better Auth with JWT tokens.
- Strict data isolation between users.
