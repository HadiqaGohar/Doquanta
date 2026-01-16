# Dockerfile for database migrations
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy project requirements
COPY pyproject.toml .

# Install dependencies using uv
RUN pip install --upgrade pip
RUN pip install uv
RUN uv pip install -r pyproject.toml --system

# Copy project
COPY . /app/

# Create non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup appuser && \
    chown -R appuser:appgroup /app
USER appuser

# Default command for running migrations
CMD ["python", "-c", "from src.main import create_db_and_tables; create_db_and_tables()"]