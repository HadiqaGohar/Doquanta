# Better Auth - Introduction Documentation

Better Auth is a framework-agnostic, universal authentication and authorization framework for TypeScript that provides comprehensive features out of the box. It offers secure email and password authentication, social sign-on, account and session management, two-factor authentication, organization and access control, and a plugin ecosystem for advanced functionalities like passkeys, multi-tenancy, multi-session support, and enterprise SSO.

The framework includes automatic database management with migrations, built-in rate limiting with custom rules, and support for most popular frameworks. Better Auth eliminates the need to reinvent authentication infrastructure, allowing developers to focus on building their applications while maintaining security and compliance standards.

## CLI MCP Configuration Commands

### Add MCP Server to Cursor

```bash
pnpm @better-auth/cli mcp --cursor
```

This command automatically configures the Better Auth MCP (Model Context Protocol) server for Cursor IDE, enabling AI-powered authentication assistance directly in your development environment.

### Add MCP Server to Claude Code

```bash
pnpm @better-auth/cli mcp --claude-code
```

Integrates the Better Auth MCP server with Claude Code, providing context-aware authentication development assistance through Claude AI.

### Add MCP Server to Open Code

```bash
pnpm @better-auth/cli mcp --open-code
```

Configures the MCP server for Open Code IDE, enabling Better Auth integration with AI coding assistants.

### Manual MCP Configuration

```bash
pnpm @better-auth/cli mcp --manual
```

Outputs manual configuration instructions for custom MCP client setup with Better Auth.

## Manual MCP Server Configuration

### Claude Code Manual Setup

```bash
claude mcp add --transport http better-auth https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp
```

This command manually adds the Better Auth MCP server to Claude Code using HTTP transport protocol. The server URL points to the Chonkie-powered Better Auth MCP endpoint, which provides AI-assisted authentication development capabilities including code generation, configuration help, and integration guidance.

### Open Code Configuration File

```json
{
    "$schema": "https://opencode.ai/config.json",
    "mcp": {
        "Better Auth": {
            "type": "remote",
            "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp",
            "enabled": true
        }
    }
}
```

Add this configuration to your `opencode.json` file to enable Better Auth MCP integration. The remote server type connects to the hosted MCP endpoint, providing authentication context and assistance without local installation. Set `enabled: true` to activate the integration immediately.

### Generic MCP Configuration

```json
{
   "Better Auth": {
       "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp"
   }
}
```

Universal MCP configuration format for `mcp.json` that works with any MCP-compatible client. Simply specify the server name and URL to enable Better Auth context in your AI development tools.

## AI Integration Resources

### LLMs.txt File Access

```bash
curl https://better-auth.com/llms.txt
```

The LLMs.txt file provides structured information that helps AI models understand Better Auth's authentication system architecture, available plugins, configuration patterns, and integration methods. This standardized format enables AI assistants to provide more accurate authentication implementation guidance.

### MCP Provider Alternatives

```javascript
// Using context7 as alternative MCP provider
{
  "mcpServers": {
    "better-auth": {
      "provider": "context7",
      "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp"
    }
  }
}
```

Better Auth supports multiple MCP providers including the first-party Chonkie-powered server, context7, and other compatible providers. Configure alternative providers in your MCP settings to choose the AI assistance backend that best fits your workflow and privacy requirements.

## Core Features Overview

### Framework Agnostic Integration

Better Auth works seamlessly with Next.js, Express, Fastify, SvelteKit, Nuxt, Solid Start, and other popular frameworks. No vendor lock-in or framework-specific code required.

### Email and Password Authentication

```typescript
// Example authentication flow
import { betterAuth } from "better-auth";

const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8
  }
});

// Register new user
await auth.api.signUp.email({
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe"
});

// Sign in
const session = await auth.api.signIn.email({
  email: "user@example.com",
  password: "securePassword123"
});
```

Secure password hashing using Argon2id, automatic email verification workflows, password strength validation, and account lockout protection.

### Social Sign-On Providers

```typescript
import { betterAuth } from "better-auth";

const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  }
});

// OAuth sign-in flow
await auth.api.signIn.social({
  provider: "google",
  callbackURL: "/auth/callback"
});
```

Built-in support for Google, GitHub, Discord, Twitter, Apple, Microsoft, and dozens of other OAuth providers with automatic token management and profile syncing.

### Account and Session Management

```typescript
// Session validation and management
const session = await auth.api.getSession({
  headers: request.headers
});

if (session) {
  console.log(`User ${session.user.email} is authenticated`);
  console.log(`Session expires: ${session.expiresAt}`);
}

// List all user sessions
const sessions = await auth.api.listSessions({
  userId: user.id
});

// Revoke specific session
await auth.api.revokeSession({
  sessionId: session.id
});

// Revoke all sessions (force logout everywhere)
await auth.api.revokeAllSessions({
  userId: user.id
});
```

Automatic session token rotation, configurable expiration policies, device fingerprinting, and multi-device session management with individual or bulk revocation capabilities.

### Built-In Rate Limiting

```typescript
import { betterAuth } from "better-auth";

const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 900000, // 15 minutes
    max: 5, // 5 attempts
    customRules: [
      {
        pathPattern: "/api/auth/sign-in",
        window: 600000, // 10 minutes
        max: 3
      }
    ]
  }
});
```

IP-based and user-based rate limiting with sliding window algorithm, custom rules per endpoint, automatic lockout on suspicious activity, and configurable retry-after headers.

### Two-Factor Authentication

```typescript
// Enable 2FA for user
const { secret, qrCode } = await auth.api.twoFactor.generate({
  userId: user.id
});

// Verify and activate 2FA
await auth.api.twoFactor.verify({
  userId: user.id,
  code: "123456",
  secret: secret
});

// Sign in with 2FA
const session = await auth.api.signIn.email({
  email: "user@example.com",
  password: "securePassword123",
  totpCode: "123456"
});

// Generate backup codes
const backupCodes = await auth.api.twoFactor.generateBackupCodes({
  userId: user.id
});
```

TOTP-based two-factor authentication with QR code generation, backup codes for account recovery, device trust management, and SMS-based verification options through plugins.

### Organization and Access Control

```typescript
// Create organization
const org = await auth.api.organization.create({
  name: "Acme Corp",
  slug: "acme-corp",
  ownerId: user.id
});

// Invite member with role
await auth.api.organization.inviteMember({
  organizationId: org.id,
  email: "member@example.com",
  role: "admin"
});

// Check permissions
const hasAccess = await auth.api.organization.checkPermission({
  userId: user.id,
  organizationId: org.id,
  permission: "billing:manage"
});

// List user organizations
const orgs = await auth.api.organization.list({
  userId: user.id
});
```

Multi-tenant organization support with role-based access control (RBAC), custom permission definitions, invitation workflows, member management, and hierarchical organization structures.

## Use Cases and Integration Patterns

Better Auth is designed for applications requiring production-grade authentication without the complexity of building from scratch. Common use cases include SaaS applications needing multi-tenant authentication with organization management, consumer applications requiring social login and 2FA, enterprise applications needing SSO and custom IDP capabilities, and API services requiring JWT-based authentication with rate limiting. The framework scales from simple email/password authentication to complex enterprise scenarios with thousands of organizations and millions of users.

The integration pattern is straightforward: install the Better Auth package, configure authentication methods and database connection, add middleware to your routes for session validation, and use the provided API methods for authentication operations. The framework handles all security best practices including password hashing, CSRF protection, session management, and token rotation automatically. Plugins extend functionality without modifying core code, making it easy to add features like passkeys, magic links, or custom OAuth providers as requirements evolve. The MCP integration brings AI-assisted development, helping teams implement authentication correctly the first time while maintaining compliance with security standards.
