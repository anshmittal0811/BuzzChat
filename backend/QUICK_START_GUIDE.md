# Quick Start Guide - Scalable Chat Backend

## 🚀 What is this?

This is a **chat application backend** that can handle many users chatting in real-time. Think of it like WhatsApp or Discord, but built to scale to thousands of users.

## 🏗 Simple Architecture Explanation

Imagine a restaurant with different departments:

1. **Reception (API Gateway)** - Takes all customer orders and directs them to the right department
2. **Kitchen Staff (Microservices)** - Each chef specializes in one thing:
   - **Auth Chef** - Handles user login/registration
   - **Chat Chef** - Manages real-time messaging
   - **Group Chef** - Creates and manages chat groups
   - **Message Chef** - Stores and retrieves message history
3. **Storage (Database & Services)** - Where everything is kept:
   - **MongoDB** - Main storage for users, messages, groups
   - **RabbitMQ** - Message delivery system between chefs
   - **Kafka** - Real-time event notifications
   - **Redis** - Quick temporary storage
   - **Cloudinary** - File and image storage

## 🔧 Prerequisites

You need these installed on your computer:
- **Docker** (Think of it as a way to run multiple applications in isolated containers)
- **Docker Compose** (Usually comes with Docker)

That's it! No need to install Node.js, MongoDB, or anything else - Docker handles everything.

## ⚡ Super Quick Setup (5 minutes)

### Step 1: Get the Code
```bash
# If you have the code already, navigate to the backend folder
cd scalable-chat/backend
```

### Step 2: Create Environment File
Create a file called `.env` in the backend folder:

```env
# Copy and paste this exactly:
MONGODB_URI=mongodb://mongodb:27017/scalable-chat
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_HOST=rabbitmq
RABBITMQ_AUTH_QUEUE=auth_queue
RABBITMQ_GROUP_QUEUE=group_queue
RABBITMQ_MESSAGE_QUEUE=message_queue
KAFKA_BROKER=kafka:9092
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

### Step 3: Start Everything
```bash
# Make the script executable (one-time setup)
chmod +x docker-start.sh

# Start all services (this will take 2-3 minutes the first time)
./docker-start.sh start
```

### Step 4: Check if Everything is Working
```bash
# Check status of all services
./docker-start.sh status
```

You should see all services running. If everything is green, you're good to go!

## 🌐 What Can You Access?

Once everything is running, you can access:

- **Main API**: http://localhost:5000
- **Chat WebSocket**: ws://localhost:3001
- **RabbitMQ Management**: http://localhost:15672 (username: guest, password: guest)
- **API Health Check**: http://localhost:5000/health

## 📱 How to Test

### Test 1: Health Check
Open your browser and go to: `http://localhost:5000/health`
You should see a response like: `{"status": "ok"}`

### Test 2: Register a User
Use a tool like Postman or curl:
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@test.com",
    "password": "password123"
  }'
```

### Test 3: Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'
```

You should get back an access token that you can use for other API calls.

## 🔧 Common Commands

```bash
# Start all services
./docker-start.sh start

# Stop all services
./docker-start.sh stop

# Restart all services
./docker-start.sh restart

# View logs from all services
./docker-start.sh logs

# View logs from specific service
./docker-start.sh logs api-gateway

# Check status
./docker-start.sh status

# Clean up everything (removes all containers and data - use carefully!)
./docker-start.sh clean
```

## 🔨 How to Make Changes

1. **Edit your code** in any service
2. **Rebuild the services**:
   ```bash
   ./docker-start.sh build
   ```
3. **Restart the services**:
   ```bash
   ./docker-start.sh restart
   ```
4. **Check logs** to see if everything is working:
   ```bash
   ./docker-start.sh logs
   ```

## 🚨 Troubleshooting

### Problem: Services won't start
**Solution**: 
```bash
# Check what's using the ports
./docker-start.sh clean
./docker-start.sh start
```

### Problem: Can't connect to database
**Solution**: 
```bash
# Check if MongoDB is running
docker-compose ps mongodb
```

### Problem: Getting authentication errors
**Solution**: 
- Make sure your `.env` file has `JWT_SECRET` set
- Check that the auth service is running: `./docker-start.sh logs auth-service`

### Problem: File uploads not working
**Solution**: 
- Make sure you have Cloudinary credentials in your `.env` file
- Or remove the Cloudinary fields to use local file storage

## 📊 Understanding the Services

### API Gateway (Port 5000)
- **What**: Main entry point for all HTTP requests
- **Handles**: User registration, login, file uploads, routing to other services
- **Think of it as**: The reception desk that handles all customer requests

### Auth Service
- **What**: Handles user authentication
- **Handles**: Login, registration, password checking, token generation
- **Think of it as**: The security guard that checks if you're allowed in

### Chat Service (Port 3001)
- **What**: Handles real-time messaging
- **Handles**: WebSocket connections, live message delivery, user presence
- **Think of it as**: The phone system that connects people for real-time conversations

### Group Service (Port 3002)
- **What**: Manages chat groups
- **Handles**: Creating groups, adding/removing members, group settings
- **Think of it as**: The event organizer that manages who's in which chat room

### Message Service (Port 3003)
- **What**: Stores and retrieves messages
- **Handles**: Saving messages to database, message history, search
- **Think of it as**: The filing cabinet that keeps all conversation history

## 📝 Next Steps

1. **Connect a Frontend**: Build a web or mobile app that connects to these APIs
2. **Add Features**: Implement message reactions, file sharing, voice messages
3. **Scale Up**: Add load balancers, multiple service instances
4. **Monitor**: Add logging, metrics, error tracking

## 🆘 Need Help?

- Check the logs: `./docker-start.sh logs`
- Look at the full documentation: `BACKEND_DOCUMENTATION.md`
- Make sure all required ports are free: 5000, 3001, 3002, 3003, 5672, 15672, 9092
- Restart everything: `./docker-start.sh restart`

---

**🎉 Congratulations!** You now have a scalable chat backend running on your machine. This setup can handle thousands of concurrent users and can be deployed to any cloud provider. 