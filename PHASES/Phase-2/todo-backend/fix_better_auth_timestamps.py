#!/usr/bin/env python3
"""
Script to fix Better Auth timestamp column naming to match Better Auth's expectations.
This addresses the 'createdAt' column missing error in the jwks table.
"""

import logging
from sqlmodel import create_engine, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_better_auth_timestamps():
    """Fix Better Auth timestamp column naming to match Better Auth's expectations."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Fixing Better Auth timestamp columns...")

        with engine.connect() as conn:
            # Add createdAt column if it doesn't exist
            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "createdAt" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "createdAt" may already exist: {e}')

            # Also add other common Better Auth timestamp columns that might be expected
            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "updatedAt" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "updatedAt" may already exist: {e}')

            # Also check other Better Auth tables for consistency
            # Add createdAt to user table if needed
            try:
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "createdAt" column to user table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "createdAt" may already exist in user table: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "updatedAt" column to user table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "updatedAt" may already exist in user table: {e}')

            # Add createdAt to account table if needed
            try:
                conn.execute(text("""
                    ALTER TABLE account ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "createdAt" column to account table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "createdAt" may already exist in account table: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE account ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "updatedAt" column to account table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "updatedAt" may already exist in account table: {e}')

            # Add createdAt to session table if needed
            try:
                conn.execute(text("""
                    ALTER TABLE session ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "createdAt" column to session table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "createdAt" may already exist in session table: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE session ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "updatedAt" column to session table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "updatedAt" may already exist in session table: {e}')

            # Add createdAt to verification table if needed
            try:
                conn.execute(text("""
                    ALTER TABLE verification ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "createdAt" column to verification table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "createdAt" may already exist in verification table: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE verification ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                """))
                logger.info('Added "updatedAt" column to verification table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "updatedAt" may already exist in verification table: {e}')

            conn.commit()
            logger.info("Timestamp columns updated successfully!")

            # Verify the jwks table structure
            logger.info("Verifying jwks table structure...")
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'jwks'
                ORDER BY ordinal_position;
            """))

            logger.info("Current jwks table columns:")
            for row in result:
                logger.info(f"  - {row[0]} ({row[1]})")

        logger.info("Better Auth timestamp columns fix completed!")

    except Exception as e:
        logger.error(f"Error fixing Better Auth timestamp columns: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting Better Auth timestamp columns fix process...")
    fix_better_auth_timestamps()
    logger.info("Process completed successfully!")