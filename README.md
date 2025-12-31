# DoQuanta - The Evolution of Todo: From CLI to Cloud-Native AI
**Powered by Hadiqa Gohar**

## Project Overview
This project, "The Evolution of Todo," is a comprehensive journey through modern software engineering. It demonstrates how a simple task management application can evolve into a sophisticated, cloud-native, AI-powered system using **Spec-Driven Development (SDD)** and the **Agentic Dev Stack**.

The project is divided into five distinct phases, each introducing new technologies and architectural patterns.

## Roadmap & Phases

### Phase I: In-Memory Python Console App
- **Goal**: Build a solid foundation with a CLI-based todo app.
- **Tech Stack**: Python 3.13+, UV, Claude Code, Spec-Kit Plus.
- **Key Features**: Basic CRUD operations (Add, View, Update, Delete, Complete) using in-memory storage.

### Phase II: Full-Stack Web Application
- **Goal**: Transform the CLI app into a multi-user web application with persistent storage.
- **Tech Stack**: Next.js, FastAPI, SQLModel, Neon Serverless PostgreSQL, Better Auth.
- **Key Features**: RESTful API, responsive frontend, and JWT-based authentication.

### Phase III: AI-Powered Chatbot
- **Goal**: Add a natural language interface using AI agents and the Model Context Protocol (MCP).
- **Tech Stack**: OpenAI Agents SDK, Official MCP SDK, ChatKit.
- **Key Features**: Manage tasks through conversational AI with stateless server architecture.

### Phase IV: Local Kubernetes Deployment
- **Goal**: Containerize the application and deploy it to a local Kubernetes cluster.
- **Tech Stack**: Docker, Minikube, Helm Charts, kubectl-ai, kagent.
- **Key Features**: Orchestration, scaling, and AIOps-driven deployment.

### Phase V: Advanced Cloud & Event-Driven Architecture
- **Goal**: Deploy to production-grade cloud Kubernetes and implement event-driven features.
- **Tech Stack**: Azure/GCP/Oracle Cloud, Kafka, Dapr.
- **Key Features**: Recurring tasks, reminders, and real-time sync using a distributed application runtime.

## Core Principles
- **Spec-Driven Development**: No code is written manually. Everything is generated from specifications (`.specify`, `.plan`, `.tasks`) using Claude Code.
- **Agentic Dev Stack**: Utilizing AI agents not just for code, but for architecture, deployment, and orchestration.
- **Cloud-Native**: Embracing containerization, microservices, and distributed systems.

## Documentation
- [Phase 1 Specification](specs/001-phase-1/spec.md)
- [Hackathon Roadmap](Hackthon.md)
- [Constitution](Constitution.md)

---
*Created as part of Hackathon II: Mastering Spec-Driven Development & Cloud Native AI.*








NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://app_user:password@localhost:5432/todo
NEON_DATABASE_URL=postgresql://neondb_owner:npg_NVYLqfh90crD@ep-dark-fire-ahmpx1jc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=34a1ae44d0ee855ead4ff65390473968
NODE_ENV=development

# Social Provider Credentials (replace with your actual credentials)
GOOGLE_CLIENT_ID=204412882328-irim2hcciejgnh8hsl4cc7om4p67v41o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_ID=Ov23litR2fTzoLVtFHkg
GITHUB_CLIENT_SECRET=a629de31abcc092ddd1e330c1b0b180cfb1ea828


<!-- ............ -->

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://app_user:password@localhost:5432/todo
NEON_DATABASE_URL=postgresql://neondb_owner:npg_NVYLqfh90crD@ep-dark-fire-ahmpx1jc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=34a1ae44d0ee855ead4ff65390473968
NODE_ENV=development

# Social Provider Credentials (replace with your actual credentials)
GOOGLE_CLIENT_ID=204412882328-irim2hcciejgnh8hsl4cc7om4p67v41o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_ID=Ov23litR2fTzoLVtFHkg
GITHUB_CLIENT_SECRET=a629de31abcc092ddd1e330c1b0b180cfb1ea828

