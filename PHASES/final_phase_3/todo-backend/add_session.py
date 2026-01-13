#!/usr/bin/env python3
"""
Script to add a session to the database dynamically.
This can be used to add Better Auth session tokens to the backend database.
"""

import logging
from sqlmodel import create_engine, Session
from src.core.settings import settings
from datetime import datetime, timedelta
import sys
import argparse


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_session_to_db(user_id: str, session_token: str, expires_in_days: int = 7):
    """Add a session to the database."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info(f"Adding session to database for user: {user_id}")

        with Session(engine) as session:
            from sqlalchemy import text
            
            # Create the session record
            session_sql = """
            INSERT OR REPLACE INTO session (id, user_id, token, expires_at, created_at, updated_at)
            VALUES (:id, :user_id, :token, :expires_at, :created_at, :updated_at);
            """
            
            import secrets
            session_id = secrets.token_urlsafe(16)  # Generate a session ID
            expires_at = datetime.now() + timedelta(days=expires_in_days)
            
            session.execute(text(session_sql), {
                "id": session_id,
                "user_id": user_id,
                "token": session_token,
                "expires_at": expires_at,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })
            
            session.commit()
            logger.info(f"Session added successfully for user: {user_id}")
            logger.info(f"Token: {session_token}")
            logger.info(f"Expires at: {expires_at}")

        logger.info("Session addition completed!")

    except Exception as e:
        logger.error(f"Error adding session to database: {e}")
        raise e

def main():
    parser = argparse.ArgumentParser(description='Add a session to the backend database')
    parser.add_argument('--user-id', required=True, help='User ID')
    parser.add_argument('--token', required=True, help='Session token')
    parser.add_argument('--expires-in', type=int, default=7, help='Days until expiration (default: 7)')
    
    args = parser.parse_args()
    
    add_session_to_db(args.user_id, args.token, args.expires_in)

if __name__ == "__main__":
    main()