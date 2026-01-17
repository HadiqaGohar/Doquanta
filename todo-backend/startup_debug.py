#!/usr/bin/env python3
"""
Debug startup script to identify Cloud Run issues
"""
import os
import sys
import traceback

def debug_startup():
    print("=== STARTUP DEBUG ===")
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    print(f"PORT env var: {os.getenv('PORT', 'NOT SET')}")
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'NOT SET')}")
    print(f"BETTER_AUTH_SECRET: {'SET' if os.getenv('BETTER_AUTH_SECRET') else 'NOT SET'}")
    
    # Check if packages are available
    try:
        import fastapi
        print(f"✅ FastAPI version: {fastapi.__version__}")
    except Exception as e:
        print(f"❌ FastAPI import error: {e}")
        
    try:
        import uvicorn
        print(f"✅ Uvicorn available")
    except Exception as e:
        print(f"❌ Uvicorn import error: {e}")
    
    # Try importing main app
    try:
        print("Attempting to import src.main...")
        from src.main import app
        print("✅ App imported successfully")
        
        # Try starting uvicorn
        port = int(os.getenv("PORT", 8080))
        print(f"Starting uvicorn on port {port}...")
        
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="debug")
        
    except Exception as e:
        print(f"❌ Error importing/starting app: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    debug_startup()