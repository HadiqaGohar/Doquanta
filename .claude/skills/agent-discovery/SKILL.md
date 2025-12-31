---
name: agent-discovery
description: Discover and list available Claude subagents and their capabilities to help developers find the right agent for specific tasks
---

# Agent Discovery Skill

This skill helps developers discover existing Claude subagents, understand their capabilities, and integrate them into workflows.

## Capabilities
- List all available Claude subagents
- Extract agent descriptions and capabilities
- Provide usage examples for each agent
- Show agent specializations and strengths
- Generate agent capability matrix
- Suggest appropriate agents for specific tasks

## When to Use
This skill is automatically invoked when:
- Discovering what agents are available in the project
- Finding the right agent for a specific task
- Understanding agent capabilities and limitations
- Generating documentation about available agents
- Planning agent usage in development workflows
- Onboarding new team members to available tools

## Context Triggers
- Mentions of "available agents", "list agents", "agent capabilities"
- Questions about existing subagents
- Agent discovery requests
- Workflow planning involving agents

## Implementation
This skill scans the `.claude/agents/` directory and parses agent markdown files to extract relevant information.