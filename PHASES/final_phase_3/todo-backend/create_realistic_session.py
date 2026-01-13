#!/usr/bin/env python3
"""
Script to insert a realistic test session into the database for testing purposes.
This creates a session with a token that mimics Better Auth's format.
"""


import logging
from sqlmodel import create_engine, Session
from src.core.settings import settings
from src.models.models import User
from datetime import datetime, timedelta
import secrets

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def insert_realistic_test_session():
    """Insert a realistic test session into the database."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Inserting realistic test session into database...")

        with Session(engine) as session:
            # Create a test user if one doesn't exist
            user_id = "nDrWmYeHrroUc3LfMmTvkXBtnFyfZMmN"  # The user ID from the logs
            # Create a test user
            from sqlalchemy import text
            user_sql = """
            INSERT OR REPLACE INTO user (id, email, name, created_at)
            VALUES (:id, :email, :name, :created_at);
            """
            session.execute(text(user_sql), {
                "id": user_id,
                "email": "test@example.com",
                "name": "Test User",
                "created_at": datetime.now()
            })
            
            # Create a realistic session token (Better Auth typically uses random tokens)
            realistic_session_token = secrets.token_urlsafe(32)  # Generate a realistic token
            expires_at = datetime.now() + timedelta(days=7)  # Expires in 7 days
            
            # Insert the session record
            session_sql = """
            INSERT OR REPLACE INTO session (id, user_id, token, expires_at, created_at, updated_at)
            VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at);
            """

            session_id = secrets.token_urlsafe(16)  # Generate a session ID
            session.execute(text(session_sql), {
                "id": session_id,
                "user_id": user_id,
                "token": realistic_session_token,
                "expires_at": expires_at,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })
            
            session.commit()
            logger.info(f"Realistic test session inserted with token: {realistic_session_token}")
            logger.info(f"User ID: {user_id}")
            logger.info(f"Expires at: {expires_at}")
            logger.info("You can now use this token for testing:")
            logger.info(f"Authorization: Bearer {realistic_session_token}")

        logger.info("Realistic test session insertion completed!")

    except Exception as e:
        logger.error(f"Error inserting realistic test session: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting realistic test session insertion process...")
    insert_realistic_test_session()
    logger.info("Process completed successfully!")