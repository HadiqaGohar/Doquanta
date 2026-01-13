import logging
import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session, text

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    """
    Add parent_id and attachments columns to the task table.
    """
    try:
        engine = create_engine(settings.database_url)
        logger.info("Starting features migration...")

        with Session(engine) as session:
            # Add parent_id
            try:
                session.exec(text("ALTER TABLE task ADD COLUMN parent_id INTEGER REFERENCES task(id);"))
                session.exec(text("CREATE INDEX ix_task_parent_id ON task (parent_id);"))
                logger.info("Added parent_id column.")
            except Exception as e:
                logger.warning(f"Could not add parent_id (might exist): {e}")

            # Add attachments
            try:
                # Using TEXT for JSON content to be safe across DBs, 
                # though Postgres has JSONB. keeping it simple as per plan.
                session.exec(text("ALTER TABLE task ADD COLUMN attachments TEXT DEFAULT '[]';"))
                logger.info("Added attachments column.")
            except Exception as e:
                logger.warning(f"Could not add attachments (might exist): {e}")

            session.commit()
            
        logger.info("Features migration completed.")

    except Exception as e:
        logger.error(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
