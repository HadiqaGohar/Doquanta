#!/usr/bin/env python3
"""
Script to update the task table ID column to be compatible with string IDs.
"""

import logging
from sqlmodel import create_engine, text
from src.core.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_task_id_type():
    """Update the task table ID column to be compatible with string IDs."""
    try:
        # Create engine using the database URL from settings
        engine = create_engine(settings.database_url)

        logger.info("Fixing task table ID column type...")

        with engine.connect() as conn:
            # First, check if there are any existing tasks
            result = conn.execute(text("SELECT COUNT(*) FROM task;"))
            task_count = result.fetchone()[0]
            logger.info(f"Found {task_count} existing tasks in the database.")

            # Check current column type
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'task' AND column_name = 'id';
            """))
            col_info = result.fetchone()
            if col_info:
                logger.info(f"Current ID column: {col_info[0]}, type: {col_info[1]}, nullable: {col_info[2]}")

            # Since SERIAL is auto-incrementing integer in PostgreSQL, we need to change it to VARCHAR
            # First, we need to drop the default value and sequence if it exists
            # Then alter the column type
            try:
                # Get the sequence name for the SERIAL column (usually table_name_id_seq)
                seq_result = conn.execute(text("""
                    SELECT pg_get_serial_sequence('task', 'id') as seq_name;
                """))
                seq_row = seq_result.fetchone()
                if seq_row and seq_row[0]:
                    seq_name = seq_row[0]
                    logger.info(f"Dropping sequence {seq_name}")
                    conn.execute(text(f"DROP SEQUENCE IF EXISTS {seq_name};"))

                # Change the column type to VARCHAR
                logger.info("Changing ID column type to VARCHAR(50)...")
                conn.execute(text("ALTER TABLE task ALTER COLUMN id TYPE VARCHAR(50);"))

                # If the column was SERIAL, it might have been NOT NULL by default, ensure it's correct
                conn.execute(text("ALTER TABLE task ALTER COLUMN id DROP NOT NULL;"))

                logger.info("ID column type changed successfully!")

            except Exception as e:
                logger.warning(f"Could not modify ID column: {e}")
                # If we can't change the column type, we'll need to recreate the table
                # But for now, let's see if we can work with the existing structure

            # Commit the changes
            conn.commit()

            # Show the updated structure
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'task' AND column_name = 'id';
            """))
            col_info = result.fetchone()
            if col_info:
                logger.info(f"Updated ID column: {col_info[0]}, type: {col_info[1]}, nullable: {col_info[2]}")

    except Exception as e:
        logger.error(f"Error fixing task ID type: {e}")
        raise e

if __name__ == "__main__":
    logger.info("Starting task ID type fix process...")
    fix_task_id_type()
    logger.info("Process completed successfully!")