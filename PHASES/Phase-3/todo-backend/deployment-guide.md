
# Google Cloud Deployment Guide

## Prerequisites

1. Install Google Cloud CLI: `gcloud`
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project YOUR_PROJECT_ID`

## Deployment Steps

### 1. Build and Push Docker Image

```bash
# Build the Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/todo-backend

# Or build locally and push
docker build -t gcr.io/YOUR_PROJECT_ID/todo-backend .
docker push gcr.io/YOUR_PROJECT_ID/todo-backend
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy todo-backend \
  --image gcr.io/YOUR_PROJECT_ID/todo-backend \
  --platform managed \
  --region YOUR_REGION \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=your_db_url,BETTER_AUTH_SECRET=your_auth_secret
```

### 3. Alternative: Deploy to App Engine

Create `app.yaml` in the todo-backend directory:
```yaml
runtime: python313
service: todo-backend

env_variables:
  DATABASE_URL: your_database_url
  BETTER_AUTH_SECRET: your_auth_secret
```

Deploy with:
```bash
gcloud app deploy --project=YOUR_PROJECT_ID
```

## Environment Variables Required

Make sure to set these environment variables:
- `DATABASE_URL`: Your PostgreSQL database connection string
- `BETTER_AUTH_SECRET`: Secret for authentication
- `JWT_ALGORITHM`: JWT algorithm (default: HS256)
- `FRONTEND_BASE_URL`: Your frontend URL for CORS

## Notes

- The application listens on port 8080 as required by Cloud Run
- The Dockerfile uses uv for faster dependency installation
- Dependencies are cached in the Docker image
- The application runs the FastAPI app from `src.main:app`