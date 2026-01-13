#!/usr/bin/env python3
"""
Script to fix Better Auth tables schema to match Better Auth's expectations.
This addresses the 'publicKey' column missing error in the jwks table.
"""

import logging
from sqlmodel import create_engine, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_better_auth_tables():
    """Fix Better Auth tables schema to match Better Auth's expectations."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Fixing Better Auth tables schema...")

        with engine.connect() as conn:
            # Add missing columns to jwks table
            # Based on Better Auth's expected schema for JWT functionality

            # Add publicKey column if it doesn't exist
            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "publicKey" TEXT;
                """))
                logger.info('Added "publicKey" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "publicKey" may already exist: {e}')

            # Add privateKey column if it doesn't exist
            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "privateKey" TEXT;
                """))
                logger.info('Added "privateKey" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "privateKey" may already exist: {e}')

            # Add additional columns that might be needed
            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "d" TEXT;
                """))
                logger.info('Added "d" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "d" may already exist: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "p" TEXT;
                """))
                logger.info('Added "p" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "p" may already exist: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "q" TEXT;
                """))
                logger.info('Added "q" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "q" may already exist: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "dp" TEXT;
                """))
                logger.info('Added "dp" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "dp" may already exist: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "dq" TEXT;
                """))
                logger.info('Added "dq" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "dq" may already exist: {e}')

            try:
                conn.execute(text("""
                    ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "qi" TEXT;
                """))
                logger.info('Added "qi" column to jwks table if it did not exist.')
            except Exception as e:
                logger.info(f'Column "qi" may already exist: {e}')

            conn.commit()
            logger.info("jwks table schema updated successfully!")

            # Verify the structure
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

        logger.info("Better Auth tables schema fix completed!")

    except Exception as e:
        logger.error(f"Error fixing Better Auth tables: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting Better Auth tables schema fix process...")
    fix_better_auth_tables()
    logger.info("Process completed successfully!")