# Implementation Plan: Phase II - Full-Stack Todo Web Application

**Branch**: `002-phase-2-web-app` | **Date**: December 28, 2025 | **Spec**: `specs/002-phase-2/spec.md`

## Summary
This plan details the implementation of the full-stack web application. We will restructure the project into a monorepo, build a FastAPI backend with PostgreSQL persistence, and a Next.js frontend with Better Auth.

## Technical Context
- **Language**: Python 3.13+, TypeScript (Node 20+)
- **Frameworks**: FastAPI, Next.js 16+
- **Database**: Neon Serverless PostgreSQL (SQLModel ORM)
- **Auth**: Better Auth (JWT)
- **Structure**: Monorepo (`todo-backend/`, `todo-frontend/`)

## Constitution Check
- [x] **SDD Adherence**: Derived from `specs/002-phase-2/spec.md`.
- [x] **AI-Native**: Using Claude Code for generation.
- [x] **Cloud-Native**: Stateless backend, external DB.
- [x] **No Manual Coding**: AI agents will generate implementation.

## Project Structure

```text
/
├── todo-backend/        # FastAPI Application
│   ├── src/
│   │   ├── api/         # Route handlers
│   │   ├── core/        # Config, Security
│   │   ├── db/          # Database session
│   │   ├── models/      # SQLModel definitions
│   │   └── main.py      # Entry point
│   └── pyproject.toml
├── todo-frontend/       # Next.js Application
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # UI Components
│   │   └── lib/         # API Client, Auth
│   └── package.json
└── specs/
    └── 002-phase-2/     # Phase 2 Documentation
```

## Implementation Phases

### Phase 1: Monorepo Setup & Infrastructure
1.  **Restructure**: Ensure `todo-backend` and `todo-frontend` folders exist.
2.  **Environment**: Configure `.env` for both apps (DB URL, Auth Secrets).
3.  **Dependencies**: Update `pyproject.toml` and `package.json`.

### Phase 2: Backend Core (FastAPI + SQLModel)
1.  **Database**: Setup `src/db/session.py` and `src/core/config.py`.
2.  **Models**: Define `User` and `Task` in `src/models/`.
3.  **Auth Middleware**: Implement JWT verification in `src/core/security.py`.

### Phase 3: Backend API Endpoints
1.  **CRUD**: Implement routes in `src/api/routes/tasks.py`.
2.  **Ownership**: Enforce `user_id` checks on all operations.
3.  **Validation**: Use Pydantic schemas for request/response.

### Phase 4: Frontend Core (Next.js + Better Auth)
1.  **Setup**: Initialize Next.js app with Tailwind.
2.  **Auth**: Configure Better Auth client and server-side utilities.
3.  **API Client**: Create `src/lib/api.ts` with Axios/Fetch interceptors for JWT.

### Phase 5: Frontend UI & Integration
1.  **Auth Pages**: Login and Signup screens.
2.  **Dashboard**: Task list with filtering and creation form.
3.  **Interactivity**: Optimistic updates, loading states, error toasts.

## Risk Analysis
- **JWT Sync**: Ensuring frontend/backend share the exact secret/algorithm.
- **CORS**: Handling cross-origin requests locally.
- **DB Connection**: Managing serverless connection pooling.