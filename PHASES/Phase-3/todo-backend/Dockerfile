# Use Python 3.13 slim image
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

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
ENV PORT=8080
EXPOSE ${PORT}

# Run the application
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT}
