#!/usr/bin/env python3
"""
Test script to insert a session into the database to verify authentication flow.
"""

import logging
from sqlmodel import create_engine, Session, text
from src.core.settings import settings
from datetime import datetime, timedelta
import secrets

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_session_insert():
    """Insert a test session to verify authentication flow."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Inserting a test session into the database...")

        # Generate a test session token and user ID
        test_user_id = "J00SZrhnf1DKSpkMmvqE9KfdILE0cu59"  # This is the user ID from the logs
        test_token = "zwP5umZExqBhzg4UKpFMU6k9m1rpwR1x.6TyIJtsybWeLgPEG7DX7/F71qcsS4NciYlxFuS2f+cY="  # This is from the logs
        expires_at = datetime.now() + timedelta(days=7)  # Set expiration for 7 days

        with Session(engine) as session:
            # Check if the user exists, if not create it
            result = session.execute(text("SELECT id FROM \"user\" WHERE id = :user_id"), {"user_id": test_user_id})
            user_result = result.first()

            if not user_result:
                logger.info(f"Creating test user with ID: {test_user_id}")
                session.execute(text("INSERT INTO \"user\" (id, email, name, created_at, updated_at) VALUES (:user_id, :email, :name, :created_at, :updated_at)"), {
                    "user_id": test_user_id,
                    "email": "test@example.com",
                    "name": "Test User",
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                })
                session.commit()

            # Check if session already exists
            result = session.execute(text("SELECT id FROM session WHERE token = :token"), {"token": test_token})
            session_result = result.first()

            if session_result:
                logger.info("Session already exists, updating...")
                session.execute(text("UPDATE session SET \"userId\" = :user_id, \"expiresAt\" = :expires_at, \"updatedAt\" = :updated_at WHERE token = :token"), {
                    "user_id": test_user_id,
                    "token": test_token,
                    "expires_at": expires_at,
                    "updated_at": datetime.now()
                })
            else:
                logger.info("Creating new session...")
                session.execute(text("INSERT INTO session (id, \"userId\", token, \"expiresAt\", \"createdAt\", \"updatedAt\") VALUES (:session_id, :user_id, :token, :expires_at, :created_at, :updated_at)"), {
                    "session_id": f"sess_{secrets.token_hex(8)}",
                    "user_id": test_user_id,
                    "token": test_token,
                    "expires_at": expires_at,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                })

            session.commit()
            logger.info(f"Test session inserted/updated for user: {test_user_id}")

        # Verify the session was inserted
        with Session(engine) as session:
            result = session.execute(text("SELECT \"userId\", \"expiresAt\" FROM session WHERE token = :token"), {"token": test_token})
            result_row = result.first()

            if result_row:
                user_id, expires_at = result_row
                logger.info(f"✓ Verification: Session found in DB for user: {user_id}, expires: {expires_at}")
            else:
                logger.error("✗ Verification: Session NOT found in DB")

    except Exception as e:
        logger.error(f"Error inserting test session: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting test session insertion process...")
    test_session_insert()
    logger.info("Process completed successfully!")