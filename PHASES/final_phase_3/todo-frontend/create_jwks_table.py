import logging
import os
from sqlmodel import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_jwks_table():
    """Create jwks table if it doesn't exist."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL not found in environment")
        return

    try:
        engine = create_engine(database_url)
        logger.info(f"Connecting to database to create jwks table...")

        with engine.connect() as conn:
            # Create jwks table for JWT functionality (if not exists)
            # Using double quotes for camelCase column names which is required by Postgres
            jwks_table_sql = """
            CREATE TABLE IF NOT EXISTS jwks (
                id TEXT PRIMARY KEY,
                "publicKey" TEXT,
                "privateKey" TEXT,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            conn.execute(text(jwks_table_sql))
            logger.info("jwks table created or already exists.")
            
            # Better Auth might also need these columns
            alter_sqls = [
                'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "publicKey" TEXT',
                'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "privateKey" TEXT',
                'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
            ]
            
            for sql in alter_sqls:
                try:
                    conn.execute(text(sql))
                except Exception as e:
                    logger.warning(f"Note: {e}")

            conn.commit()
            logger.info("✓ jwks table setup completed!")

    except Exception as e:
        logger.error(f"Error creating jwks table: {e}")
        # raise e

if __name__ == "__main__":
    create_jwks_table()
