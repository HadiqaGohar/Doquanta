#!/usr/bin/env python3
"""
Script to create Better Auth tables that may be missing from the database.
This addresses the 'jwks' table missing error that occurs when using Better Auth with JWT plugin.
"""

import logging

from sqlmodel import create_engine, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_better_auth_tables():
    """Create Better Auth tables if they don't exist."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Creating Better Auth tables if they don't exist...")

        with engine.connect() as conn:
            # Create jwks table for JWT functionality
            jwks_table_sql = """
            CREATE TABLE IF NOT EXISTS jwks (
                id VARCHAR PRIMARY KEY,
                use VARCHAR(5),
                kty VARCHAR(10),
                kid VARCHAR UNIQUE,
                alg VARCHAR(10),
                n TEXT,
                e VARCHAR(255),
                x TEXT,
                y TEXT,
                crv TEXT,
                d TEXT,
                p TEXT,
                q TEXT,
                dp TEXT,
                dq TEXT,
                qi TEXT,
                "publicKey" TEXT,
                "privateKey" TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            conn.execute(text(jwks_table_sql))
            conn.commit()
            logger.info("jwks table created or already exists.")

            # Verify that the jwks table was created
            from sqlalchemy import inspect
            inspector = inspect(engine)
            jwks_exists = inspector.has_table("jwks")

            if jwks_exists:
                logger.info("✓ jwks table successfully created!")
            else:
                logger.error("✗ jwks table was not created properly")

        logger.info("Better Auth tables setup completed!")

    except Exception as e:
        logger.error(f"Error creating Better Auth tables: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting Better Auth tables creation process...")
    create_better_auth_tables()
    logger.info("Process completed successfully!")