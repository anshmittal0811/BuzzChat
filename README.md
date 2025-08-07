# 🚀 BuzzChat - Scalable Chat Application

A modern, real-time chat application built with a microservices architecture, featuring instant messaging, group chats, file sharing, and user presence tracking. Designed to scale to thousands of concurrent users.

![Chat Application](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## ✨ Features

### 💬 Real-time Messaging
- **Instant messaging** with WebSocket connections
- **Group chat** functionality with unlimited members
- **Message persistence** and chat history
- **Message status tracking** (sent, delivered, seen)
- **Typing indicators** and user presence

### 👥 User Management
- **User authentication** with JWT tokens
- **User profiles** with customizable avatars
- **Online/offline status** tracking
- **User search** and discovery

### 📁 File Sharing
- **Image and file uploads** with Cloudinary integration
- **File preview** and download capabilities
- **Multiple file format support**

### 🏗 Scalable Architecture
- **Microservices architecture** for horizontal scaling
- **Load balancer** for chat services
- **Message queuing** with RabbitMQ
- **Event streaming** with Kafka
- **Redis caching** for performance optimization

## 🏛 Architecture Overview

![BuzzChat Architecture](frontend/public/Architecture.png)

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session management
- **Message Queue**: RabbitMQ for service communication
- **Event Streaming**: Kafka for real-time events
- **WebSocket**: Socket.IO for real-time communication
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Cloudinary for asset management
- **Load Balancer**: Nginx for chat service distribution

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with Shadcn components
- **State Management**: React Context API with SWR
- **Real-time**: Socket.IO client
- **Forms**: React Hook Form with Zod validation
- **File Upload**: Custom chunked upload implementation

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Health Checks**: Built-in service health monitoring
- **Environment**: Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Git** for cloning the repository

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd scalable-chat
```

### 2. Backend Setup
```bash
cd backend

# Create environment file
cp .env.example .env

# Edit .env with your configuration (see Environment Variables section)
nano .env

# Start all services with Docker
chmod +x docker-start.sh
./docker-start.sh start
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5000
- **Chat WebSocket**: ws://localhost:3001
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://mongodb:27017/scalable-chat
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_HOST=rabbitmq
RABBITMQ_AUTH_QUEUE=auth_queue
RABBITMQ_GROUP_QUEUE=group_queue
RABBITMQ_MESSAGE_QUEUE=message_queue

# Kafka
KAFKA_BROKER=kafka:9092

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Environment
NODE_ENV=development
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### User Endpoints
- `GET /users` - Get all users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile

### Group Endpoints
- `POST /groups` - Create new group
- `GET /groups` - Get user's groups
- `POST /groups/:id/members` - Add members to group
- `DELETE /groups/:id/members/:userId` - Remove member from group

### Message Endpoints
- `GET /messages/:groupId` - Get group messages
- `POST /messages` - Send message
- `DELETE /messages/:id` - Delete message

### File Upload
- `POST /assets/upload` - Upload file/image

## 🔌 WebSocket Events

### Client → Server
```typescript
// Send message
socket.emit('chat.message.send', {
  groupId: string,
  content: string,
  attachments?: File[]
});

// Mark message as seen
socket.emit('chat.message.seen', {
  messageId: string,
  groupId: string
});

// User presence heartbeat
socket.emit('user.heartbeat', {
  userId: string,
  status: 'online' | 'offline'
});
```

### Server → Client
```typescript
// New message received
socket.on('chat.message.incoming', (message) => {
  // Handle new message
});

// Message seen confirmation
socket.on('chat.message.seen', (data) => {
  // Update message status
});

// Group created notification
socket.on('group.created', (group) => {
  // Handle new group
});
```

## 🗂 Project Structure

```
scalable-chat/
├── backend/                    # NestJS Backend
│   ├── apps/                   # Microservices
│   │   ├── api/               # API Gateway
│   │   ├── auth/              # Authentication Service
│   │   ├── chat/              # Chat Service (WebSocket)
│   │   ├── group/             # Group Management
│   │   ├── message/           # Message Service
│   │   └── user/              # User Service
│   ├── libs/shared/           # Shared Libraries
│   │   ├── schemas/           # Database Schemas
│   │   ├── dtos/              # Data Transfer Objects
│   │   ├── services/          # Shared Services
│   │   └── modules/           # Shared Modules
│   ├── docker-compose.yml     # Infrastructure Setup
│   └── Dockerfile             # Multi-stage Build
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   ├── components/        # React Components
│   │   ├── pages/             # Next.js Pages
│   │   ├── contexts/          # React Contexts
│   │   ├── hooks/             # Custom Hooks
│   │   ├── services/          # API Services
│   │   └── types/             # TypeScript Types
│   └── public/                # Static Assets
└── README.md                  # This file
```

## 🔧 Development Commands

### Backend Commands
```bash
# Start all services
./docker-start.sh start

# Stop all services
./docker-start.sh stop

# View logs
./docker-start.sh logs

# Check service status
./docker-start.sh status

# Rebuild services
./docker-start.sh build

# Clean up (removes all data!)
./docker-start.sh clean

# Individual service development
npm run start:api      # API Gateway
npm run start:auth     # Auth Service
npm run start:chat     # Chat Service
```

### Frontend Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Load Testing
```bash
# Test load balancer
./test-load-balancer.sh
```

## 📊 Monitoring & Health Checks

### Service Health Endpoints
- API Gateway: `GET /health`
- Individual services have built-in health checks
- Docker health checks for all infrastructure services

### Logs
```bash
# View all service logs
./docker-start.sh logs

# View specific service logs
docker-compose logs api-gateway
docker-compose logs chat-service-1
```

## 🆘 Troubleshooting

### Common Issues

**Services won't start**
```bash
./docker-start.sh clean
./docker-start.sh start
```

**Database connection issues**
- Check if MongoDB container is running: `docker-compose ps mongodb`
- Verify environment variables in `.env`

**WebSocket connection issues**
- Ensure chat services are running: `./docker-start.sh status`
- Check load balancer configuration
- Verify firewall settings for port 3001

**File upload issues**
- Configure Cloudinary credentials
- Check file size limits
- Verify network connectivity

### Getting Help
- Check the [Backend Documentation](backend/BACKEND_DOCUMENTATION.md)
- Review [Quick Start Guide](backend/QUICK_START_GUIDE.md)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Happy Chatting! 💬** 
