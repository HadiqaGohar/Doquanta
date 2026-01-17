#!/usr/bin/env python3
"""
Minimal FastAPI app for Cloud Run debugging
"""
import os
from fastapi import FastAPI

app = FastAPI(title="DoQuanta Debug API")

@app.get("/")
def root():
    return {
        "message": "DoQuanta API is running!",
        "port": os.getenv("PORT", "8080"),
        "database_url": "configured" if os.getenv("DATABASE_URL") else "missing",
        "auth_secret": "configured" if os.getenv("BETTER_AUTH_SECRET") else "missing"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "doquanta-debug"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)