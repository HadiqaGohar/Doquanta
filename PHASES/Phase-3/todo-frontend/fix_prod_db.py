import logging
import psycopg2
from psycopg2 import sql

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_db():
    # Production Neon URL
    url = "postgresql://neondb_owner:npg_NVYLqfh90crD@ep-dark-fire-ahmpx1jc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    try:
        logger.info("Connecting to Neon production database...")
        conn = psycopg2.connect(url)
        conn.autocommit = True
        cur = conn.cursor()
        
        logger.info("Creating jwks table...")
        # Create jwks table with correct schema for Better Auth
        cur.execute("""
            CREATE TABLE IF NOT EXISTS jwks (
                id TEXT PRIMARY KEY,
                "publicKey" TEXT,
                "privateKey" TEXT,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Ensure all columns exist
        columns = [
            'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "publicKey" TEXT',
            'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "privateKey" TEXT',
            'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
            'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
        ]
        
        for cmd in columns:
            try:
                cur.execute(cmd)
            except Exception as e:
                logger.warning(f"Column check note: {e}")
                
        logger.info("✓ jwks table setup completed successfully on Production!")
        
        cur.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error fixing production database: {e}")
        return False

if __name__ == "__main__":
    fix_db()
