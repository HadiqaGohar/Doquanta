# Phase 4: Cloud-Native Commands

## Docker Commands

### Building Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Running Services
```bash
# Start all services in detached mode
docker-compose up -d

# Start all services with rebuild
docker-compose up --build

# Start specific service
docker-compose up backend

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Managing Containers
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# View running containers
docker ps
```

## Kubernetes Commands

### Local Development (Minikube)
```bash
# Start Minikube
minikube start

# Apply Kubernetes manifests
kubectl apply -f kubernetes/

# Check pods
kubectl get pods -n todo-app

# Check services
kubectl get svc -n todo-app

# View logs
kubectl logs -f deployment/backend-deployment -n todo-app
kubectl logs -f deployment/frontend-deployment -n todo-app

# Port forward for local access
kubectl port-forward service/frontend-service -n todo-app 3000:80
kubectl port-forward service/backend-service -n todo-app 8000:80
```

### Helm Commands
```bash
# Install the application using Helm
helm install todo-app ./charts/todo-app --namespace todo-app --create-namespace

# Upgrade the application
helm upgrade todo-app ./charts/todo-app --namespace todo-app

# Check Helm releases
helm list -n todo-app

# Uninstall
helm uninstall todo-app -n todo-app
```

## Dapr Commands
```bash
# Check Dapr status
dapr status -k

# View Dapr sidecar logs
dapr logs todo-backend -k
dapr logs todo-frontend -k

# List Dapr components
kubectl get components.dapr.io -n todo-app

# Invoke service using Dapr
dapr invoke --app-id todo-backend --method healthz
```

## Kafka Commands
```bash
# List Kafka topics
kafka-topics --bootstrap-server localhost:9092 --list

# Create a topic
kafka-topics --create --topic test-topic --bootstrap-server localhost:9092

# Consume messages from a topic
kafka-console-consumer --topic task-events --from-beginning --bootstrap-server localhost:9092

# Produce a message to a topic
echo "test message" | kafka-console-producer --topic test-topic --bootstrap-server localhost:9092
```

## Development Commands
```bash
# Run backend locally
cd todo-backend && uvicorn src.main:app --reload

# Run frontend locally
cd todo-frontend && npm run dev

# Run tests
cd todo-backend && python -m pytest
cd todo-frontend && npm test

# Check environment
docker --version
docker-compose --version
kubectl version --client
helm version
dapr --version
```