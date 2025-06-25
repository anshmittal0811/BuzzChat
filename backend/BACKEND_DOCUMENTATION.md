# Scalable Chat Backend - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Microservices](#microservices)
6. [Database Schemas](#database-schemas)
7. [API Endpoints](#api-endpoints)
8. [Real-time Communication](#real-time-communication)
9. [Docker Setup](#docker-setup)
10. [Development Guide](#development-guide)
11. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

The **Scalable Chat Backend** is a modern, microservices-based chat application built with **NestJS**. It's designed to handle real-time messaging, user authentication, group management, and file sharing at scale.

### Key Features
- **Real-time messaging** using WebSockets
- **Microservices architecture** for scalability
- **User authentication** with JWT tokens
- **Group chat functionality**
- **File upload and sharing**
- **Message persistence** and history
- **User presence tracking**
- **Event-driven communication** between services

---

## 🏗 Architecture

### Microservices Architecture
The application follows a **microservices pattern** where each service has a specific responsibility:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway    │    │  Auth Service   │
│   (React/Next)  │◄──►│  (Port 5000)    │◄──►│  (RabbitMQ)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │Chat Service │ │Group Svc  │ │Message Svc│
        │(Port 3001)  │ │(Port 3002)│ │(Port 3003)│
        │WebSocket+HTTP│ │HTTP+RMQ   │ │HTTP+RMQ   │
        └─────────────┘ └───────────┘ └───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐         ┌──────▼──────┐      ┌──────▼──────┐
   │MongoDB  │         │  RabbitMQ   │      │   Kafka     │
   │Database │         │Message Queue│      │Event Stream │
   └─────────┘         └─────────────┘      └─────────────┘
```

### Communication Patterns
1. **HTTP REST API**: Client ↔ API Gateway ↔ Services
2. **RabbitMQ**: Async communication between microservices
3. **Kafka**: Event streaming for real-time notifications
4. **WebSocket**: Real-time bidirectional communication for chat

---

## 🛠 Technologies Used

### Core Framework
- **NestJS**: Node.js framework for building scalable server-side applications
- **TypeScript**: Strongly typed JavaScript for better development experience

### Database & Storage
- **MongoDB**: NoSQL database for storing users, messages, groups
- **Mongoose**: ODM (Object Document Mapper) for MongoDB
- **Redis**: In-memory cache for session management and performance

### Message Queuing & Events
- **RabbitMQ**: Message broker for service-to-service communication
- **Kafka**: Distributed event streaming platform
- **Socket.IO**: Real-time WebSocket communication

### Authentication & Security
- **JWT (JSON Web Tokens)**: Stateless authentication
- **bcrypt**: Password hashing
- **Passport**: Authentication middleware

### File Handling
- **Cloudinary**: Cloud-based image and video management
- **Multer**: Middleware for file uploads

### DevOps & Deployment
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

---

## 📁 Project Structure

```
backend/
├── apps/                          # Microservices applications
│   ├── api/                       # API Gateway (Main entry point)
│   │   ├── src/
│   │   │   ├── controllers/       # HTTP route handlers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── group.controller.ts
│   │   │   │   └── asset.controller.ts
│   │   │   ├── guards/            # Authentication guards
│   │   │   └── main.ts            # Application entry point
│   │   └── test/                  # E2E tests
│   ├── auth/                      # Authentication Service
│   ├── chat/                      # Chat Service (WebSocket)
│   ├── group/                     # Group Management Service
│   ├── message/                   # Message Handling Service
│   └── user/                      # User Management Service
├── libs/                          # Shared libraries
│   └── shared/
│       ├── dtos/                  # Data Transfer Objects
│       ├── schemas/               # Database schemas
│       ├── services/              # Shared services
│       ├── modules/               # Shared modules
│       └── interfaces/            # TypeScript interfaces
├── docker-compose.yml             # Docker services configuration
├── Dockerfile                     # Multi-stage Docker build
└── package.json                   # Dependencies and scripts
```

---

## 🚀 Microservices

### 1. API Gateway (`apps/api`)
**Port: 5000** | **Type: HTTP Server**

The main entry point that routes requests to appropriate microservices.

**Responsibilities:**
- Route HTTP requests to microservices
- Handle CORS configuration
- Aggregate responses from multiple services
- Asset upload handling

**Key Files:**
- `app.module.ts`: Main application module with RabbitMQ connections
- `controllers/`: HTTP endpoint handlers
- `guards/jwt-auth.guard.ts`: JWT authentication middleware

### 2. Auth Service (`apps/auth`)
**Type: RabbitMQ Microservice**

Handles all authentication and user management operations.

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Password hashing and verification
- User profile management

**Key Components:**
```typescript
// Message Patterns
{ cmd: 'user.register' }     // User registration
{ cmd: 'user.login' }        // User authentication
{ cmd: 'token.refresh' }     // Token refresh
{ cmd: 'user.verify' }       // Token verification
```

### 3. Chat Service (`apps/chat`)
**Port: 3001** | **Type: HTTP + WebSocket Server**

Manages real-time chat functionality using WebSockets.

**Responsibilities:**
- WebSocket connection management
- Real-time message broadcasting
- User presence tracking
- Message seen/delivery status

**WebSocket Events:**
```typescript
// Client → Server
'chat.message.send'          // Send new message
'chat.message.seen'          // Mark message as seen
'chat.message.delete'        // Delete message
'user.heartbeat'             // User presence update

// Server → Client
'chat.message.incoming'      // New message received
'chat.message.seen'          // Message seen confirmation
'chat.message.deleted'       // Message deletion notification
'group.created'              // New group notification
```

### 4. Group Service (`apps/group`)
**Port: 3002** | **Type: HTTP + RabbitMQ Microservice**

Manages group creation, membership, and permissions.

**Responsibilities:**
- Create and manage chat groups
- Add/remove group members
- Group permission management
- Group metadata handling

### 5. Message Service (`apps/message`)
**Port: 3003** | **Type: HTTP + RabbitMQ Microservice**

Handles message persistence, history, and management.

**Responsibilities:**
- Store messages in database
- Message history retrieval
- Message search functionality
- File attachment handling

---

## 🗄 Database Schemas

### User Schema
```typescript
{
  firstName: string;        // User's first name
  lastName: string;         // User's last name
  email: string;            // Unique email address
  password: string;         // Hashed password (not selected by default)
  profileUrl: string;       // Profile picture URL
  createdAt: Date;          // Account creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

### Message Schema
```typescript
{
  content?: string;         // Message text content (optional)
  sender: ObjectId;         // Reference to User who sent message
  group: ObjectId;          // Reference to Group where message was sent
  attachment?: {            // Optional file attachment
    filename: string;
    url: string;
    type: string;
    size: number;
  };
  createdAt: Date;          // Message creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

### Group Schema
```typescript
{
  name?: string;            // Group name (optional for direct messages)
  imageUrl?: string;        // Group profile picture
  createdAt: Date;          // Group creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

### Group Member Schema
```typescript
{
  group: ObjectId;          // Reference to Group
  user: ObjectId;           // Reference to User
  role: 'admin' | 'member'; // User role in group
  joinedAt: Date;           // When user joined group
  lastSeenAt: Date;         // Last seen timestamp in group
}
```

### Presence Schema
```typescript
{
  user: ObjectId;           // Reference to User
  group: ObjectId;          // Reference to Group
  lastSeen: Date;           // Last activity timestamp
  isOnline: boolean;        // Current online status
}
```

---

## 🌐 API Endpoints

### Authentication Endpoints (`/auth`)

#### POST `/auth/register`
Register a new user account.
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/login`
Authenticate user and get tokens.
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/refresh`
Refresh access token using refresh token.
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### User Endpoints (`/users`)

#### GET `/users`
Get list of users (with pagination and search).
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (optional)
```

#### GET `/users/:id`
Get specific user details.

### Group Endpoints (`/groups`)

#### POST `/groups`
Create a new group.
```json
{
  "name": "Project Team",
  "memberIds": ["userId1", "userId2"]
}
```

#### GET `/groups`
Get user's groups.

#### POST `/groups/:id/members`
Add members to group.

#### DELETE `/groups/:id/members/:userId`
Remove member from group.

### Asset Endpoints (`/assets`)

#### POST `/assets/upload`
Upload file chunks.
```
Multipart form data:
- chunk: File
- filename: string
- chunkIndex: number
- totalChunks: number
```

#### POST `/assets/complete-upload`
Complete chunked file upload.
```json
{
  "filename": "document.pdf",
  "totalChunks": 5
}
```

---

## ⚡ Real-time Communication

### WebSocket Connection
The chat service handles WebSocket connections for real-time features.

#### Connection Authentication
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

#### Message Flow
1. **User sends message** → WebSocket event to chat service
2. **Chat service** → Publishes event to Kafka
3. **Message service** → Consumes event and saves to database
4. **Chat service** → Broadcasts message to group members via WebSocket

#### Presence Tracking
- Users send periodic heartbeat events
- System tracks last seen timestamps
- Other users receive presence updates

---

## 🐳 Docker Setup

### Services Configuration
The application runs in Docker containers orchestrated by Docker Compose.

#### Infrastructure Services
- **MongoDB**: Database server
- **Redis**: Caching and session storage
- **RabbitMQ**: Message broker with management UI
- **Kafka + Zookeeper**: Event streaming platform

#### Application Services
All microservices run in separate containers with:
- **Health checks**: Monitor service availability
- **Auto restart**: Services restart on failure
- **Network isolation**: Services communicate via Docker network
- **Environment variables**: Configuration through .env file

### Quick Start Commands
```bash
# Start all services
./docker-start.sh start

# View logs
./docker-start.sh logs

# Check status
./docker-start.sh status

# Stop services
./docker-start.sh stop

# Clean up
./docker-start.sh clean
```

---

## 👨‍💻 Development Guide

### Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scalable-chat/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create `.env` file with required variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/scalable-chat
   REDIS_HOST=localhost
   REDIS_PORT=6379
   RABBITMQ_URI=amqp://rabbitmq:5672
   RABBITMQ_USER=guest
   RABBITMQ_PASS=guest
   RABBITMQ_HOST=rabbitmq
   KAFKA_BROKER=kafka:9092
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start with Docker**
   ```bash
   ./docker-start.sh start
   ```

### Development Workflow

1. **Make code changes**
2. **Rebuild affected services**
   ```bash
   ./docker-start.sh build
   ```
3. **Restart services**
   ```bash
   ./docker-start.sh restart
   ```
4. **Check logs for debugging**
   ```bash
   ./docker-start.sh logs [service-name]
   ```

### Testing

#### Unit Tests
```bash
npm run test
```

#### E2E Tests
```bash
npm run test:e2e
```

#### Test Coverage
```bash
npm run test:cov
```

---

## 🔧 Key Implementation Details

### Service Communication

#### RabbitMQ Pattern
Services communicate using message patterns:
```typescript
// Send message to auth service
this.authService.send(
  { cmd: 'user.login' }, 
  loginDto
)
```

#### Kafka Events
Real-time events are published to Kafka:
```typescript
// Publish message event
this.kafkaService.produce('chat.message.received', {
  content: 'Hello World',
  senderId: 'user123',
  groupId: 'group456'
});
```

### Authentication Flow
1. User submits login credentials
2. API Gateway forwards to Auth Service via RabbitMQ
3. Auth Service validates credentials
4. JWT tokens generated and returned
5. Subsequent requests include JWT in Authorization header
6. JWT Guard validates tokens before processing requests

### File Upload Process
1. **Chunked Upload**: Large files are split into chunks
2. **Temporary Storage**: Chunks stored in `/app/dist/temp_chunks/`
3. **Assembly**: Chunks combined when upload completes
4. **Cloud Upload**: Complete file uploaded to Cloudinary
5. **Cleanup**: Temporary files removed
6. **URL Return**: Cloudinary URL returned to client

### WebSocket Security
- JWT token required for WebSocket connection
- Token validated on connection
- User ID stored in socket session
- All WebSocket events include sender authentication

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Connection Errors
**Problem**: Services can't connect to RabbitMQ/Kafka
**Solution**: 
- Check environment variables
- Verify Docker network connectivity
- Check service logs: `./docker-start.sh logs [service-name]`

#### 2. Database Connection Issues
**Problem**: MongoDB connection failures
**Solution**:
- Use `localhost:27017` for external connections
- Use `mongodb:27017` for internal Docker connections
- Check MongoDB container status

#### 3. JWT Authentication Errors
**Problem**: "secret or public key must be provided"
**Solution**:
- Ensure `JWT_SECRET` environment variable is set
- Check JWT configuration in affected services

#### 4. File Upload Permissions
**Problem**: "EACCES: permission denied" during file upload
**Solution**:
- Check Docker container permissions
- Verify upload directory creation in Dockerfile

#### 5. WebSocket Connection Failures
**Problem**: WebSocket authentication failures
**Solution**:
- Verify JWT token in connection auth
- Check token expiration
- Ensure chat service has JWT configuration

### Debugging Commands
```bash
# Check all service status
docker-compose ps

# View specific service logs
./docker-start.sh logs api-gateway

# Restart specific service
docker-compose restart chat-service

# Check network connectivity
docker network ls
docker network inspect scalable-chat_default

# Access service shell
docker-compose exec api-gateway sh
```

### Health Checks
All services include health check endpoints:
- API Gateway: `http://localhost:5000/health`
- Chat Service: `http://localhost:3001/health`
- Group Service: `http://localhost:3002/health`
- Message Service: `http://localhost:3003/health`

---

## 📊 Performance Considerations

### Scalability Features
- **Microservices**: Independent scaling of services
- **Message Queuing**: Async processing prevents blocking
- **Caching**: Redis for session and data caching
- **Database Indexing**: Optimized queries with proper indexes
- **Chunked Uploads**: Efficient large file handling

### Monitoring & Observability
- Health checks for all services
- Comprehensive logging
- Error handling and reporting
- Service timeout configurations

---

## 🔮 Future Enhancements

### Planned Features
1. **Message Encryption**: End-to-end encryption for messages
2. **Push Notifications**: Mobile push notification support
3. **Voice/Video Calls**: WebRTC integration
4. **Message Reactions**: Emoji reactions to messages
5. **Advanced Search**: Full-text search across messages
6. **Admin Dashboard**: Management interface
7. **Analytics**: Usage metrics and reporting

### Architecture Improvements
1. **API Versioning**: Versioned API endpoints
2. **Rate Limiting**: Request throttling
3. **Load Balancing**: Multiple service instances
4. **Circuit Breakers**: Fault tolerance patterns
5. **Distributed Tracing**: Request tracking across services

---

## 📚 Additional Resources

### Documentation Links
- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Mongoose Guide](https://mongoosejs.com/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### API Testing
Use tools like Postman or Insomnia to test the APIs:
- Import the provided collection
- Set environment variables for base URL and tokens
- Test authentication flow first
- Use WebSocket testing tools for real-time features

---

*This documentation provides a comprehensive overview of the Scalable Chat Backend. For specific implementation details, refer to the source code and inline comments.* 