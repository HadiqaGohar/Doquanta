<!--
Sync Impact Report:
Version change: 0.0.0 (initial) -> 1.0.0 (minor)
Modified principles: None (initial creation)
Added sections: Core Principles, Development Guidelines, Architectural Guidelines, Governance
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md: ✅ updated
- .specify/templates/spec-template.md: ✅ updated
- .specify/templates/tasks-template.md: ✅ updated
- .specify/templates/commands/*.md: ✅ updated
Follow-up TODOs: None
-->
# Hackathon II: The Evolution of Todo – Mastering Spec-Driven Development & Cloud Native AI Constitution

## Core Principles

### I. Spec-Driven Development (SDD)
Every feature and modification MUST follow the Spec-Driven Development lifecycle: Specify → Plan → Tasks → Implement. No code is to be generated or modified until the specification is complete, approved, and broken down into atomic tasks. This ensures alignment, prevents "vibe coding," and guarantees traceability from requirements to implementation.

### II. AI-Native & Agentic Development
AI agents, including Claude Code, OpenAI Agents SDK, and MCP SDK, are primary tools for development. This project mandates the intelligent use of AI-assisted tools for Docker operations (Gordon), Kubernetes operations (kubectl-ai, kagent), and specification management (Spec-Kit Plus). Agents MUST adhere to their defined roles and responsibilities within the Agentic Dev Stack.

### III. Iterative & Phased Evolution
The project will evolve through distinct phases, starting from a basic in-memory console application and progressing to a fully-featured, cloud-native AI chatbot. Each phase builds upon the previous, requiring a clear understanding and implementation of its specific objectives and technology stack.

### IV. Cloud-Native First
Architecture and deployment MUST prioritize cloud-native principles, utilizing Docker for containerization, Kubernetes (Minikube, DOKS) for orchestration, Helm Charts for package management, Kafka for event-driven architecture, and Dapr for distributed application runtime. Solutions should be designed for scalability, resilience, and maintainability in a cloud environment.

### V. No Manual Coding Constraint
Developers and agents alike are strictly forbidden from writing code manually. All code generation MUST be performed by AI agents, which will refine the Spec until the desired output is achieved. The focus shifts from manual syntax writing to architectural design and specification refinement.

### VI. Knowledge Capture & Traceability
All user inputs and significant decisions MUST be recorded in Prompt History Records (PHRs) for learning and traceability. Architecturally significant decisions MUST be explicitly suggested for documentation via Architectural Decision Records (ADRs) to capture reasoning and tradeoffs.

## Development Guidelines

### Technology Stack Adherence
Each phase has a defined technology stack (e.g., Next.js, FastAPI, SQLModel, Neon DB, OpenAI ChatKit, Kafka, Dapr). Adherence to these specified technologies is mandatory. Additional tools or libraries may be integrated only if they align with the overall architectural principles and are explicitly documented.

### Monorepo Organization
The project will maintain a monorepo structure with dedicated folders for frontend, backend, and specifications, as outlined in the Spec-Kit Monorepo Folder Structure. This organization facilitates a single context for AI agents and streamlines cross-cutting changes.

### Security Best Practices
Security considerations are paramount. Implementations MUST prevent common vulnerabilities (e.g., command injection, XSS, SQL injection). All JWT tokens and shared secrets MUST be managed securely (e.g., via environment variables, Dapr Secrets API, Kubernetes Secrets). User isolation and authenticated access are non-negotiable for API endpoints.

## Governance

This Constitution serves as the foundational document for Hackathon II. Its principles supersede all other practices and specifications.

Amendments to this Constitution require:
1.  Documentation of proposed changes and their rationale.
2.  Approval by project architects/mentors.
3.  A version increment following semantic versioning rules (MAJOR for incompatible changes, MINOR for new principles/sections, PATCH for clarifications).
4.  Propagation of amendments across dependent templates (plan, spec, tasks) to ensure consistency.

Compliance with these principles will be reviewed at each phase of the Hackathon.

**Version**: 1.0.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27
