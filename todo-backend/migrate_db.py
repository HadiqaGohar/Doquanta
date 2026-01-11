import asyncio
from sqlalchemy import create_engine, text, inspect
from sqlmodel import Session, SQLModel
from src.core.settings import settings
from src.models.models import Task, User # Import models
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    """
    Perform database migrations for the Todo application.
    This script handles schema changes for production-like environments.
    Compatible with SQLite and PostgreSQL.
    """
    try:
        # Use the engine from settings
        engine = create_engine(settings.database_url)
        logger.info("Starting database migration...")
        
        inspector = inspect(engine)

        with Session(engine) as session:
            # Create all tables defined in the models
            SQLModel.metadata.create_all(engine)

            # Check if the users table exists
            if not inspector.has_table("user"):
                logger.info("Creating users table...")
                # Note: SQLModel.metadata.create_all should have created it, but keeping manual fallback just in case
                # Adjust for SQLite/Postgres differences if needed, but SQLModel is preferred.
                # Assuming SQLModel worked, this block might not be reached.
                # If we really need manual SQL for some reason:
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
            if not inspector.has_table("task"):
                logger.info("Creating tasks table...")
                # Similarly, relying on SQLModel or fallback
                # Note: SERIAL is Postgres only. SQLite uses INTEGER PRIMARY KEY AUTOINCREMENT
                is_postgres = "postgresql" in settings.database_url
                id_type = "SERIAL PRIMARY KEY" if is_postgres else "INTEGER PRIMARY KEY AUTOINCREMENT"
                
                session.exec(text(f"""
                    CREATE TABLE task (
                        id {id_type},
                        user_id VARCHAR NOT NULL REFERENCES "user"(id),
                        title VARCHAR NOT NULL,
                        description TEXT,
                        completed BOOLEAN DEFAULT 0,
                        priority VARCHAR(20) DEFAULT 'medium',
                        category VARCHAR(50) DEFAULT 'other',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        due_date TIMESTAMP,
                        reminder_time TIMESTAMP,
                        is_recurring BOOLEAN DEFAULT 0,
                        recurrence_pattern VARCHAR(50),
                        recurrence_interval INTEGER,
                        recurrence_end_date TIMESTAMP,
                        max_occurrences INTEGER
                    );
                """))
                session.commit()
                logger.info("Tasks table created successfully.")
            else:
                logger.info("Tasks table already exists, checking for missing columns...")

                existing_columns = [col['name'] for col in inspector.get_columns("task")]
                
                # Check and add missing columns if needed
                columns_to_add = [
                    ("due_date", "TIMESTAMP WITH TIME ZONE"), # SQLite: DATETIME
                    ("reminder_time", "TIMESTAMP WITH TIME ZONE"),
                    ("is_recurring", "BOOLEAN DEFAULT FALSE"), # SQLite: 0/1
                    ("recurrence_pattern", "VARCHAR(50)"),
                    ("recurrence_interval", "INTEGER"),
                    ("recurrence_end_date", "TIMESTAMP WITH TIME ZONE"),
                    ("max_occurrences", "INTEGER"),
                    ("updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
                ]
                
                is_sqlite = "sqlite" in settings.database_url

                for col_name, col_type in columns_to_add:
                    try:
                        if col_name not in existing_columns:
                            logger.info(f"Adding {col_name} column...")
                            
                            final_type = col_type
                            if is_sqlite:
                                if "BOOLEAN" in col_type:
                                    final_type = "BOOLEAN DEFAULT 0"
                                elif "TIMESTAMP" in col_type:
                                    final_type = "DATETIME"

                            session.exec(text(f"ALTER TABLE task ADD COLUMN {col_name} {final_type};"))
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
