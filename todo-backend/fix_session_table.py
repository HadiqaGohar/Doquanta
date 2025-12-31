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
            # First, check what columns currently exist in the session table
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'session'
                ORDER BY ordinal_position;
            """))

            logger.info("Current session table columns:")
            for row in result:
                logger.info(f"  - {row[0]} ({row[1]})")

            # Check if user_id column exists, if not, try userId
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'session' AND column_name = 'user_id';
            """))
            user_id_exists = bool(result.fetchone())

            if not user_id_exists:
                logger.info("user_id column doesn't exist, checking for userId...")
                result = conn.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'session' AND column_name = 'userId';
                """))
                user_id_exists = bool(result.fetchone())

                if not user_id_exists:
                    logger.info("Adding userId column to session table...")
                    conn.execute(text("ALTER TABLE session ADD COLUMN \"userId\" VARCHAR;"))
                    logger.info("Added userId column.")

            # Check if token column exists (it should be named 'token')
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'session' AND column_name = 'token';
            """))
            token_exists = bool(result.fetchone())

            if not token_exists:
                logger.info("token column doesn't exist, checking for sessionToken...")
                result = conn.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'session' AND column_name = 'sessionToken';
                """))
                session_token_exists = bool(result.fetchone())

                if session_token_exists:
                    logger.info("Renaming sessionToken to token...")
                    conn.execute(text("ALTER TABLE session RENAME COLUMN \"sessionToken\" TO \"token\";"))
                else:
                    logger.info("Adding token column to session table...")
                    conn.execute(text("ALTER TABLE session ADD COLUMN \"token\" VARCHAR UNIQUE;"))

            # Check if expires_at column exists
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'session' AND column_name = 'expires_at';
            """))
            expires_at_exists = bool(result.fetchone())

            if not expires_at_exists:
                logger.info("expires_at column doesn't exist, checking for expiresAt...")
                result = conn.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'session' AND column_name = 'expiresAt';
                """))
                expires_at_exists = bool(result.fetchone())

                if not expires_at_exists:
                    logger.info("Adding expiresAt column to session table...")
                    conn.execute(text("ALTER TABLE session ADD COLUMN \"expiresAt\" TIMESTAMP WITH TIME ZONE;"))

            # Commit the changes
            conn.commit()

            logger.info("Session table structure fixed successfully!")

            # Show the updated structure
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'session'
                ORDER BY ordinal_position;
            """))

            logger.info("Updated session table columns:")
            for row in result:
                logger.info(f"  - {row[0]} ({row[1]})")

    except Exception as e:
        logger.error(f"Error fixing session table: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting session table fix process...")
    fix_session_table()
    logger.info("Process completed successfully!")