from sqlmodel import create_engine, Session
from src.core.settings import settings
from contextlib import contextmanager


# Create the database engine
connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}

# Add pooling configuration for PostgreSQL (Neon) to prevent SSL connection drops
engine_args = {
    "connect_args": connect_args,
    "pool_pre_ping": True,  # Verify connection before usage
    "pool_recycle": 300,    # Recycle connections every 5 minutes
}

# Only add pool size options for non-SQLite databases (SQLite doesn't support them in the same way with StaticPool)
if "sqlite" not in settings.database_url:
    engine_args["pool_size"] = 5
    engine_args["max_overflow"] = 10

engine = create_engine(
    settings.database_url,
    **engine_args
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