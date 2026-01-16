# Cloud-Native Todo Application

This project implements a cloud-native todo application following modern architecture principles with containerization, orchestration, and distributed systems patterns.

## Architecture Overview

The application follows a cloud-native architecture with the following components:

- **Frontend**: Next.js application served via Node.js
- **Backend**: FastAPI application with REST API
- **Database**: PostgreSQL for persistent storage
- **Cache**: Redis for session storage and caching
- **Message Broker**: Apache Kafka for event streaming
- **Service Mesh**: Dapr for distributed application runtime
- **Orchestration**: Kubernetes for container orchestration
- **Package Management**: Helm for Kubernetes package management

## Components

### 1. Containerization
- Multi-stage Docker builds for optimized images
- Non-root user execution for security
- Minimal base images to reduce attack surface
- Health checks for container readiness/liveness

### 2. Kubernetes Orchestration
- Deployments for application services
- Services for internal communication
- ConfigMaps and Secrets for configuration
- PersistentVolumes for stateful storage
- Horizontal Pod Autoscalers for dynamic scaling

### 3. Event-Driven Architecture
- Apache Kafka for message streaming
- Event producers for task operations
- Topic-based event categorization
- Asynchronous processing patterns

### 4. Distributed Runtime
- Dapr sidecars for service invocation
- State management through Dapr
- Pub/Sub messaging via Dapr
- Secret management through Dapr

## Deployment

### Local Development
```bash
# Using docker-compose
docker-compose up --build

# Or deploy to local Kubernetes with Minikube
minikube start
kubectl create namespace todo-app
helm install todo-app ./charts/todo-app --namespace todo-app
```

### Production Deployment
```bash
# Deploy to cloud Kubernetes
helm install todo-app ./charts/todo-app \
  --namespace todo-app \
  --set backend.image.repository=your-registry/todo-backend \
  --set backend.image.tag=latest \
  --set frontend.image.repository=your-registry/todo-frontend \
  --set frontend.image.tag=latest
```

## Configuration

The application uses environment variables and Kubernetes ConfigMaps/Secrets for configuration:

### Backend Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `BETTER_AUTH_SECRET`: Authentication secret
- `NEXT_PUBLIC_APP_URL`: Application URL
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka broker addresses

### Helm Values
See `charts/todo-app/values.yaml` for all configurable parameters.

## Scaling

The application is designed to scale horizontally:

- Backend and frontend deployments can scale independently
- Horizontal Pod Autoscalers based on CPU utilization
- Database connection pooling for efficient resource usage
- Redis clustering for shared state

## Security

- Non-root containers for reduced privileges
- Network policies for service isolation
- Secrets management for sensitive data
- JWT-based authentication
- Input validation and sanitization

## Monitoring

- Kubernetes-native health checks
- Application-level metrics
- Structured logging
- Distributed tracing (via Dapr)

## Development

For local development, refer to the individual service README files:

- `todo-backend/README.md`
- `todo-frontend/README.md`

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**: Verify `DATABASE_URL` is correctly set
2. **Kafka Connection Issues**: Ensure Kafka brokers are accessible
3. **Dapr Sidecar Issues**: Check Dapr placement service is running
4. **Image Pull Issues**: Verify image repository and tag in Helm values

## Contributing

Follow the spec-driven development process:

1. Update specifications in `/specs`
2. Generate implementation plan
3. Create tasks based on the plan
4. Implement following the tasks
5. Test thoroughly