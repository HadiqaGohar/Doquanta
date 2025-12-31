from sqlmodel import create_engine
from src.core.settings import settings

# Create the database engine
engine = create_engine(
    settings.database_url,
    # Add any additional engine configuration options here
    # echo=True  # Uncomment to see SQL queries in logs
)