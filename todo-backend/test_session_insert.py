#!/usr/bin/env python3
"""
Script to insert a test session into the database for testing purposes.
"""


import logging
from sqlmodel import create_engine, Session, select
from src.core.settings import settings
from src.models.models import User
from datetime import datetime, timedelta
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def insert_test_session():
    """Insert a test session into the database."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Inserting test session into database...")

        with Session(engine) as session:
            # Create a test user if one doesn't exist
            user_id = "nDrWmYeHrroUc3LfMmTvkXBtnFyfZMmN"  # The user ID from the logs
            existing_user = session.get(User, user_id)
            
            if not existing_user:
                # Create a test user
                test_user = User(
                    id=user_id,
                    email="test@example.com",
                    name="Test User"
                )
                session.add(test_user)
                session.commit()
                logger.info(f"Created test user with ID: {user_id}")
            else:
                logger.info(f"Test user already exists with ID: {user_id}")

            # Create a test session
            session_token = "test_session_token_12345"  # This is what we'll use for testing
            expires_at = datetime.now() + timedelta(hours=24)  # Expires in 24 hours
            
            # Check if session already exists
            existing_session_query = select(User).where(User.id == user_id)
            existing_session = session.get(User, user_id)
            
            # Insert the session record (SQLite uses different syntax)
            session_sql = """
            INSERT OR REPLACE INTO session (id, user_id, token, expires_at, created_at, updated_at)
            VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at);
            """

            from sqlalchemy import text
            session.execute(text(session_sql), {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "token": session_token,
                "expires_at": expires_at,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })
            
            session.commit()
            logger.info(f"Test session inserted with token: {session_token}")
            logger.info(f"User ID: {user_id}")
            logger.info(f"Expires at: {expires_at}")

        logger.info("Test session insertion completed!")

    except Exception as e:
        logger.error(f"Error inserting test session: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting test session insertion process...")
    insert_test_session()
    logger.info("Process completed successfully!")