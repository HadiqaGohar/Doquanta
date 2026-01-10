import logging
from sqlmodel import create_engine, Session, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migrations():
    """
    Run all necessary database migrations to ensure schema compatibility.
    Adds missing columns for task features (due_date, reminders, subtasks, attachments).
    """
    try:
        # Use the engine with pooling settings from session.py logic would be ideal, 
        # but creating a fresh one for migration is fine.
        engine = create_engine(settings.database_url)
        logger.info("Starting production database migration...")

        with Session(engine) as session:
            # 1. Check for basic task fields
            columns_to_add = [
                ("due_date", "TIMESTAMP WITH TIME ZONE"),
                ("reminder_time", "TIMESTAMP WITH TIME ZONE"),
                ("is_recurring", "BOOLEAN DEFAULT FALSE"),
                ("recurrence_pattern", "VARCHAR(50)"),
                ("recurrence_interval", "INTEGER"),
                ("recurrence_end_date", "TIMESTAMP WITH TIME ZONE"),
                ("max_occurrences", "INTEGER"),
                ("updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"),
                ("attachments", "TEXT DEFAULT '[]'"),
            ]

            for col_name, col_type in columns_to_add:
                try:
                    # Check if column exists
                    # Note: information_schema query works for Postgres
                    col_result = session.exec(text(f"""
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_name = 'task' AND column_name = '{col_name}';
                    """))

                    if not col_result.first():
                        logger.info(f"Adding missing column: {col_name}")
                        session.exec(text(f"ALTER TABLE task ADD COLUMN {col_name} {col_type};"))
                    else:
                        logger.debug(f"Column {col_name} already exists.")
                except Exception as e:
                    logger.warning(f"Error checking/adding {col_name}: {e}")

            # 2. Check for parent_id (Self-referential foreign key needs special handling)
            try:
                col_result = session.exec(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'task' AND column_name = 'parent_id';
                """))
                
                if not col_result.first():
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
