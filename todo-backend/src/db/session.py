from sqlmodel import create_engine, Session
from src.core.settings import settings
from contextlib import contextmanager


# Create the database engine
connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}
engine = create_engine(
    settings.database_url,
    connect_args=connect_args
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