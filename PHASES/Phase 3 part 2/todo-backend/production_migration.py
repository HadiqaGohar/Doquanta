import logging
from sqlalchemy import create_engine, text, inspect
from sqlmodel import Session
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migrations():
    """
    Run all necessary database migrations to ensure schema compatibility.
    Adds missing columns for task features (due_date, reminders, subtasks, attachments).
    Compatible with both SQLite and PostgreSQL.
    """
    try:
        engine = create_engine(settings.database_url)
        logger.info("Starting production database migration...")

        # Use SQLAlchemy Inspector to check for existing columns
        inspector = inspect(engine)
        
        # Check if table exists first
        if not inspector.has_table("task"):
            logger.info("Table 'task' does not exist yet. Skipping migration (will be created by SQLModel).")
            return

        existing_columns = [col['name'] for col in inspector.get_columns("task")]
        
        with Session(engine) as session:
            # 1. Check for basic task fields
            columns_to_add = [
                ("due_date", "TIMESTAMP WITH TIME ZONE"), # SQLite: DATETIME or TEXT
                ("reminder_time", "TIMESTAMP WITH TIME ZONE"),
                ("is_recurring", "BOOLEAN DEFAULT FALSE"), # SQLite: INTEGER (0/1)
                ("recurrence_pattern", "VARCHAR(50)"),
                ("recurrence_interval", "INTEGER"),
                ("recurrence_end_date", "TIMESTAMP WITH TIME ZONE"),
                ("max_occurrences", "INTEGER"),
                ("updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"),
                ("attachments", "TEXT DEFAULT '[]'"),
            ]

            is_sqlite = "sqlite" in settings.database_url

            for col_name, col_type in columns_to_add:
                try:
                    if col_name not in existing_columns:
                        logger.info(f"Adding missing column: {col_name}")
                        
                        # Adjust types for SQLite if necessary (though SQLAlchemy/SQLite often handles generic types)
                        final_type = col_type
                        if is_sqlite:
                            if "BOOLEAN" in col_type:
                                final_type = "BOOLEAN DEFAULT 0"
                            elif "TIMESTAMP" in col_type:
                                final_type = "DATETIME" # Or TEXT

                        session.exec(text(f"ALTER TABLE task ADD COLUMN {col_name} {final_type};"))
                    else:
                        logger.debug(f"Column {col_name} already exists.")
                except Exception as e:
                    logger.warning(f"Error checking/adding {col_name}: {e}")

            # 2. Check for parent_id (Self-referential foreign key)
            try:
                if "parent_id" not in existing_columns:
                    logger.info("Adding parent_id column...")
                    session.exec(text("ALTER TABLE task ADD COLUMN parent_id INTEGER REFERENCES task(id);"))
                    session.exec(text("CREATE INDEX IF NOT EXISTS ix_task_parent_id ON task (parent_id);"))
                else:
                    logger.debug("Column parent_id already exists.")
            except Exception as e:
                logger.warning(f"Error checking/adding parent_id: {e}")

            session.commit()
            
        logger.info("Production migration completed successfully.")

    except Exception as e:
        logger.error(f"Migration failed: {e}")
