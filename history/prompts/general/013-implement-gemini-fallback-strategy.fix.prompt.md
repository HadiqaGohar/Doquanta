---
id: "013"
title: "implement-gemini-fallback-strategy"
stage: "fix"
date: "2026-01-11"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "chatbot"
branch: "main"
user: "hadiqa"
command: "fix-rate-limit"
labels: ["chatbot", "ai", "rate-limit", "resilience"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "todo-backend/src/services/ai_service.py"
tests:
  - "manual code review"
---

# User Request
User reported the chatbot failed in production with a `429 Too Many Requests` error for `gemini-2.0-flash`.

# Response
Analyzed the error logs confirming the rate limit hit on the specific model.
Modified `AIService` to include a fallback mechanism.
Wrapped the LLM call in a retry block that catches `RateLimitError` and `APIError`.
If the primary model fails with a 429, the service now automatically retries with `gemini-1.5-flash`.

# Outcome
The chatbot is now resilient to rate limits on the cutting-edge model by falling back to a stable tier, ensuring continuous service availability.
