#!/usr/bin/env python3
"""
Script to create all Better Auth tables that are missing from the database.
Better Auth creates these tables when using it directly, but since we're handling
authentication in the backend separately, we need to create these tables manually.
"""


import logging
from sqlmodel import create_engine, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_better_auth_tables():
    """Create all Better Auth tables if they don't exist."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Creating Better Auth tables if they don't exist...")

        with engine.connect() as conn:
            # Create users table (if not exists)
            users_table_sql = """
            CREATE TABLE IF NOT EXISTS "user" (
                id VARCHAR PRIMARY KEY,
                email VARCHAR UNIQUE NOT NULL,
                email_verified TIMESTAMP WITH TIME ZONE,
                name VARCHAR,
                image TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            conn.execute(text(users_table_sql))
            logger.info("Users table created or already exists.")

            # Create accounts table (if not exists)
            accounts_table_sql = """
            CREATE TABLE IF NOT EXISTS account (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR NOT NULL REFERENCES "user"(id),
                account_type VARCHAR NOT NULL,
                provider_id VARCHAR NOT NULL,
                provider_user_id VARCHAR NOT NULL,
                access_token TEXT,
                refresh_token TEXT,
                id_token TEXT,
                expires_at BIGINT,
                password VARCHAR,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(provider_id, provider_user_id)
            );
            """
            conn.execute(text(accounts_table_sql))
            logger.info("Accounts table created or already exists.")

            # Create sessions table (if not exists) - This is the main table we need
            sessions_table_sql = """
            CREATE TABLE IF NOT EXISTS session (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR NOT NULL REFERENCES "user"(id),
                token VARCHAR UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            conn.execute(text(sessions_table_sql))
            logger.info("Sessions table created or already exists.")

            # Create verification table (if not exists)
            verification_table_sql = """
            CREATE TABLE IF NOT EXISTS verification (
                id VARCHAR PRIMARY KEY,
                identifier VARCHAR NOT NULL,
                value VARCHAR NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            conn.execute(text(verification_table_sql))
            logger.info("Verification table created or already exists.")

            # Create jwks table for JWT functionality (if not exists)
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
            logger.info("jwks table created or already exists.")

            conn.commit()

            # Verify that the session table was created (SQLite-specific query)
            result = conn.execute(text("""
                SELECT name FROM sqlite_master WHERE type='table' AND name='session';
            """))
            session_exists = result.fetchone() is not None

            if session_exists:
                logger.info("✓ Session table successfully created!")
            else:
                logger.error("✗ Session table was not created properly")

            logger.info("Better Auth tables setup completed!")

    except Exception as e:
        logger.error(f"Error creating Better Auth tables: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting Better Auth tables creation process...")
    create_better_auth_tables()
    logger.info("Process completed successfully!")