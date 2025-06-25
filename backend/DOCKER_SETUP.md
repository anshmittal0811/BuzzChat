# Docker Setup for Scalable Chat Backend

This guide explains how to run all microservices using Docker instead of manually starting each service.

## 🏗 Architecture Overview

Our NestJS monorepo contains the following services:

### Services and Ports
- **API Gateway** (`apps/api`): Port 5000 - Main HTTP gateway
- **Auth Service** (`apps/auth`): RabbitMQ microservice - Handles authentication
- **Chat Service** (`apps/chat`): Port 3001 - WebSocket chat functionality
- **Group Service** (`apps/group`): Port 3002 - Group management + RabbitMQ
- **Message Service** (`apps/message`): Port 3003 - Message handling + RabbitMQ

### Infrastructure
- **RabbitMQ**: Ports 5672 (AMQP), 15672 (Management UI)
- **Kafka**: Port 9092
- **Zookeeper**: Port 2181 (Kafka dependency)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for development)

### 1. Environment Setup
Create a `.env` file in the backend directory:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/scalable-chat
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ Configuration
RABBITMQ_URI=amqp://rabbitmq:5672
RABBITMQ_AUTH_QUEUE=auth_queue
RABBITMQ_GROUP_QUEUE=group_queue
RABBITMQ_MESSAGE_QUEUE=message_queue

# Kafka Configuration
KAFKA_BROKER=kafka:9092

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Node Environment
NODE_ENV=production
```

### 2. Using the Docker Manager Script

We've created a convenient script to manage all services:

```bash
# Make the script executable (already done)
chmod +x docker-start.sh

# Start all services
./docker-start.sh start

# View logs
./docker-start.sh logs

# View logs for specific service
./docker-start.sh logs api-gateway

# Check service status
./docker-start.sh status

# Stop all services
./docker-start.sh stop

# Restart all services
./docker-start.sh restart

# Build all services (after code changes)
./docker-start.sh build

# Clean up everything (containers, images, volumes)
./docker-start.sh clean
```

### 3. Manual Docker Commands

If you prefer manual control:

```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## 🔧 Development Workflow

### Making Code Changes
1. Make your changes to the code
2. Rebuild the affected services: `./docker-start.sh build`
3. Restart services: `./docker-start.sh restart`

### Debugging
- View all logs: `./docker-start.sh logs`
- View specific service logs: `./docker-start.sh logs [service-name]`
- Check service health: `./docker-start.sh status`

## 📋 Service URLs

Once started, you can access:

- **API Gateway**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Chat Service**: http://localhost:3001
- **Group Service**: http://localhost:3002
- **Message Service**: http://localhost:3003
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 🐳 Docker Configuration Details

### Unified Dockerfile
- Uses multi-stage builds for optimal image size
- Supports building any app via `APP_NAME` build argument
- Runs as non-root user for security
- Listens on `0.0.0.0` for container networking

### Docker Compose Features
- **Service Dependencies**: Ensures RabbitMQ/Kafka start before apps
- **Health Checks**: Monitors service health
- **Auto Restart**: Services restart unless manually stopped
- **Volume Persistence**: RabbitMQ data persists across restarts
- **Custom Network**: All services communicate on isolated network

### Service Communication
- Services communicate via Docker network names
- RabbitMQ: `rabbitmq:5672`
- Kafka: `kafka:9092`
- MongoDB/Redis should be configured to run in Docker network

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 5000, 3001-3003, 5672, 15672, 9092 are free
2. **Build failures**: Run `./docker-start.sh clean` then `./docker-start.sh build`
3. **Service won't start**: Check logs with `./docker-start.sh logs [service-name]`
4. **Database connection**: Ensure MongoDB/Redis are accessible from Docker network

### Health Checks
All services include health checks that you can monitor:
```bash
# Check if all services are healthy
docker-compose ps

# View health check logs
docker-compose logs [service-name]
```

## 📝 Migration from Manual Setup

If you were previously running services manually:

1. **Stop all manual processes** (Ctrl+C on each terminal)
2. **Create .env file** as shown above
3. **Start with Docker**: `./docker-start.sh start`
4. **Verify services**: `./docker-start.sh status`

Your services will now run in Docker containers instead of your local Node.js processes. 