from src.main import app

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8080))
    # Run the app imported from src.main
    uvicorn.run(app, host="0.0.0.0", port=port)