from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file = ".env",
        case_sensitive = False,
        extra="ignore",
    )

    # Database settings
    database_url: str = "sqlite:///./todo.db"  # Default fallback 


    # Better Auth settings
    better_auth_secret: str = "default_secret_for_dev"  # Default fallback
    jwt_algorithm: str = "HS256"

    # Application settings
    environment: str = "development"
    app_name: str = "DoQuanta Todo API"
    version: str = "1.0.0"
    debug: bool = False

    frontend_base_url: str = "http://localhost:3000"

# Create a single instance of settings
settings = Settings()
