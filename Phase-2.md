# Phase II: Todo Full-Stack Web Application - Comprehensive Details

## Overview
Phase II focuses on transforming the initial console application into a secure, modern, multi-user web application. This involves building a robust REST API with FastAPI, a responsive frontend with Next.js, and implementing secure authentication to ensure user data isolation.

## Technology Stack
- **Frontend**: Next.js 16+ (App Router, TypeScript, Tailwind CSS)
- **Backend**: Python FastAPI (SQLModel ORM)
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth (JWT tokens for backend verification)
- **Development Tools**: Claude Code + Spec-Kit Plus

---

## Backend API Specification

### Base URL
` /api/{user_id}/ `

### Authentication
All endpoints require a valid JWT token in the `Authorization` header: `Bearer <token>`. The system verifies the token and ensures the `user_id` matches the path parameter.

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/{user_id}/tasks` | List all tasks for the authenticated user (with filtering) |
| **POST** | `/api/{user_id}/tasks` | Create a new task |
| **GET** | `/api/{user_id}/tasks/{id}` | Get a specific task by ID |
| **PUT** | `/api/{user_id}/tasks/{id}` | Update an existing task |
| **DELETE**| `/api/{user_id}/tasks/{id}` | Delete a task |
| **PATCH** | `/api/{user_id}/tasks/{id}/complete` | Toggle completion status |

### Search & Filter Parameters (GET)
- `skip`, `limit`: Pagination controls.
- `keyword`: Search title or description (case-insensitive).
- `completed`: Filter by status (true/false).
- `date_from`, `date_to`: Filter by creation timestamp.

---

## Frontend Features

### User Experience
- **Registration & Login**: Secure sign-up and sign-in flows using Better Auth.
- **Dashboard**: A central hub to view, add, and manage tasks.
- **Responsive Design**: Optimized for desktop, tablet, and mobile.
- **Real-time Feedback**: Loading states and toast notifications for operations.

### Task Management UI
- Inline editing and status toggling.
- Priority indicators (High, Medium, Low).
- Due date and reminder pickers.
- Filter and search bar.

---

## Security & Data Isolation
- **User Isolation**: The backend strictly enforces that a user can only interact with tasks associated with their `user_id`.
- **JWT Verification**: Both the frontend (Better Auth) and backend (FastAPI) share a secret key to sign and verify tokens.
- **Protected Routes**: Frontend middleware prevents unauthorized access to the dashboard.

---

## Environment Configuration

### Backend (`.env`)
- `DATABASE_URL`: Connection string for Neon PostgreSQL.
- `BETTER_AUTH_SECRET`: Shared secret for JWT verification.
- `JWT_ALGORITHM`: Usually `HS256`.

### Frontend (`.env.local`)
- `NEXT_PUBLIC_BASE_URL`: e.g., `http://localhost:3000`
- `BETTER_AUTH_URL`: e.g., `http://localhost:3000`
- `BETTER_AUTH_SECRET`: Same secret as backend.
- `DATABASE_URL`: Required for Better Auth schema management.
- `SMTP_*`: Configuration for email services (password reset).

---

## Architecture Flow
1. **Login**: User logs in via Next.js; Better Auth issues a JWT.
2. **API Call**: Frontend sends request to FastAPI with `Authorization: Bearer <token>`.
3. **Verification**: FastAPI verifies the JWT using the shared secret.
4. **Processing**: Backend identifies the user ID from the token and executes DB queries filtered by that ID.
5. **Response**: Data is returned to the frontend and rendered in the UI.
