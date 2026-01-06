import logging
import psycopg2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_schema():
    url = "postgresql://neondb_owner:npg_NVYLqfh90crD@ep-dark-fire-ahmpx1jc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        
        # Check session table
        logger.info("Checking 'session' table columns...")
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'session';
        """)
        columns = cur.fetchall()
        for col in columns:
            logger.info(f"Column: {col[0]}, Type: {col[1]}")
            
        # Check user table
        logger.info("\nChecking 'user' table columns...")
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user';
        """)
        columns = cur.fetchall()
        for col in columns:
            logger.info(f"Column: {col[0]}, Type: {col[1]}")

        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
