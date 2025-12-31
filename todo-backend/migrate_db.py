import asyncio
from sqlmodel import create_engine, Session, text
from src.core.settings import settings
from src.models.models import Task  # Import the Task model from the correct location
from src.db.session import engine  # Import the engine from session module if available
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    """
    Perform database migrations for the Todo application.
    This script handles schema changes for production-like environments.
    """
    try:
        # Use the engine from settings
        engine = create_engine(settings.database_url)

        logger.info("Starting database migration...")

        with Session(engine) as session:
            # Create all tables defined in the models
            from src.models.models import Task, User  # Ensure the models are loaded from correct location
            from sqlmodel import SQLModel
            SQLModel.metadata.create_all(engine)

            # Check if the users table exists
            user_result = session.exec(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'user'
                );
            """))

            user_exists_row = user_result.first()
            user_table_exists = user_exists_row[0] if user_exists_row else False

            if not user_table_exists:
                logger.info("Creating users table...")
                session.exec(text("""
                    CREATE TABLE "user" (
                        id VARCHAR PRIMARY KEY,
                        email VARCHAR UNIQUE NOT NULL,
                        name VARCHAR,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """))
                logger.info("Users table created successfully.")
            else:
                logger.info("Users table already exists.")

            # Check if the tasks table exists
            task_result = session.exec(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'task'
                );
            """))

            task_exists_row = task_result.first()
            task_table_exists = task_exists_row[0] if task_exists_row else False

            if not task_table_exists:
                logger.info("Creating tasks table...")
                session.exec(text("""
                    CREATE TABLE task (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR NOT NULL REFERENCES "user"(id),
                        title VARCHAR NOT NULL,
                        description TEXT,
                        completed BOOLEAN DEFAULT FALSE,
                        priority VARCHAR(20) DEFAULT 'medium',
                        category VARCHAR(50) DEFAULT 'other',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        due_date TIMESTAMP WITH TIME ZONE,
                        reminder_time TIMESTAMP WITH TIME ZONE,
                        is_recurring BOOLEAN DEFAULT FALSE,
                        recurrence_pattern VARCHAR(50),
                        recurrence_interval INTEGER,
                        recurrence_end_date TIMESTAMP WITH TIME ZONE,
                        max_occurrences INTEGER
                    );
                """))
                session.commit()
                logger.info("Tasks table created successfully.")
            else:
                logger.info("Tasks table already exists, checking for missing columns...")

                # Check and add missing columns if needed
                columns_to_add = [
                    ("due_date", "TIMESTAMP WITH TIME ZONE"),
                    ("reminder_time", "TIMESTAMP WITH TIME ZONE"),
                    ("is_recurring", "BOOLEAN DEFAULT FALSE"),
                    ("recurrence_pattern", "VARCHAR(50)"),
                    ("recurrence_interval", "INTEGER"),
                    ("recurrence_end_date", "TIMESTAMP WITH TIME ZONE"),
                    ("max_occurrences", "INTEGER"),
                    ("updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")  # Add updated_at column if missing
                ]

                for col_name, col_type in columns_to_add:
                    try:
                        # Check if column exists
                        col_result = session.exec(text(f"""
                            SELECT column_name
                            FROM information_schema.columns
                            WHERE table_name = 'task' AND column_name = '{col_name}';
                        """))

                        col_exists_row = col_result.first()
                        if not col_exists_row:
                            logger.info(f"Adding {col_name} column...")
                            session.exec(text(f"ALTER TABLE task ADD COLUMN {col_name} {col_type};"))
                            logger.info(f"{col_name} column added successfully.")
                        else:
                            logger.info(f"{col_name} column already exists.")
                    except Exception as e:
                        logger.error(f"Error adding {col_name}: {e}")

                session.commit()

        logger.info("Database migration completed successfully!")

    except Exception as e:
        logger.error(f"Database migration failed: {e}")
        raise e

def check_db_connection():
    """
    Check if the database connection is working properly.
    """
    try:
        engine = create_engine(settings.database_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info("Database connection successful!")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting migration process...")

    # First, check if we can connect to the database
    if not check_db_connection():
        logger.error("Cannot proceed with migration due to database connection issues.")
        exit(1)

    # Proceed with migration
    migrate()
