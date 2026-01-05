from sqlmodel import create_engine, Session
from src.core.settings import settings
from contextlib import contextmanager


# Create the database engine
engine = create_engine(
    settings.database_url,
    # Add any additional engine configuration options here
    # echo=True  # Uncomment to see SQL queries in logs
)

from typing import Generator

# Function for FastAPI dependency injection
def get_session() -> Generator[Session, None, None]:
    """Function to get database session for FastAPI dependency injection."""
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()