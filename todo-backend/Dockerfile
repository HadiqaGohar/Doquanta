# Multi-stage build for FastAPI backend
# Build stage
FROM python:3.13-slim AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies for building
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy project requirements
COPY pyproject.toml .

# Install dependencies using uv
RUN pip install --upgrade pip
RUN pip install uv
RUN uv pip install -r pyproject.toml --system --target=/app/packages

# Production stage
FROM python:3.13-slim AS production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/packages:${PYTHONPATH}

# Install system dependencies for runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy packages from builder stage
COPY --from=builder /app/packages /app/packages

# Copy project source code
COPY . /app/

# Create non-root user with specific UID/GID
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup appuser

# Change ownership of the app directory
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
ENV PORT=8080
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/docs || exit 1

# Run the application
CMD python -m uvicorn src.main:app --host 0.0.0.0 --port ${PORT}
