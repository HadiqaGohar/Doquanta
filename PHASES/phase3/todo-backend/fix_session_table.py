#!/usr/bin/env python3
"""
Script to fix the session table structure to match Better Auth expectations.
"""

import logging
from sqlmodel import create_engine, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_session_table():
    """Fix the session table structure to match Better Auth."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Fixing session table structure...")

        with engine.connect() as conn:
            # First, check what columns currently exist in the session table (SQLite-specific query)
            result = conn.execute(text("PRAGMA table_info(session);"))

            logger.info("Current session table columns:")
            columns_info = result.fetchall()
            current_columns = [col[1] for col in columns_info]  # Column name is at index 1
            for col in columns_info:
                logger.info(f"  - {col[1]} ({col[2]})")  # name (type)

            # Check if userId column exists (Better Auth format)
            user_id_exists = 'userId' in current_columns or 'user_id' in current_columns

            if not user_id_exists:
                logger.info("Adding userId column to session table...")
                conn.execute(text("ALTER TABLE session ADD COLUMN \"userId\" TEXT;"))
                logger.info("Added userId column.")

            # Check if token column exists (it should be named 'token')
            token_exists = 'token' in current_columns or 'sessionToken' in current_columns

            if not token_exists:
                logger.info("Adding token column to session table...")
                conn.execute(text("ALTER TABLE session ADD COLUMN \"token\" TEXT UNIQUE;"))
                logger.info("Added token column.")

            # Check if expiresAt column exists (Better Auth format)
            expires_at_exists = 'expiresAt' in current_columns or 'expires_at' in current_columns

            if not expires_at_exists:
                logger.info("Adding expiresAt column to session table...")
                conn.execute(text("ALTER TABLE session ADD COLUMN \"expiresAt\" TEXT;"))  # TEXT for datetime in SQLite

            # Commit the changes
            conn.commit()

            logger.info("Session table structure fixed successfully!")

            # Show the updated structure
            result = conn.execute(text("PRAGMA table_info(session);"))

            logger.info("Updated session table columns:")
            for row in result:
                logger.info(f"  - {row[1]} ({row[2]})")  # name (type)

    except Exception as e:
        logger.error(f"Error fixing session table: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting session table fix process...")
    fix_session_table()
    logger.info("Process completed successfully!")