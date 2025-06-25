#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Scalable Chat Backend Services Manager (Load Balanced)${NC}"
echo "=================================================================="

# Function to display help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services with load balancer"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs        - Show logs for all services"
    echo "  logs [name] - Show logs for specific service"
    echo "  status      - Show status of all services"
    echo "  build       - Build all services"
    echo "  scale       - Show scaling information"
    echo "  health      - Check health of all chat service instances"
    echo "  clean       - Stop and remove all containers and images"
    echo "  help        - Show this help message"
    echo ""
    echo "Available services:"
    echo "  - api-gateway (port 5000)"
    echo "  - auth-service"
    echo "  - chat-load-balancer (port 3001) -> 3 instances"
    echo "    ├── chat-service-1"
    echo "    ├── chat-service-2"
    echo "    └── chat-service-3"
    echo "  - group-service (port 3002)"
    echo "  - message-service (port 3003)"
    echo "  - rabbitmq (ports 5672, 15672)"
    echo "  - kafka (port 9092)"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting all services with load balancer...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ All services started!${NC}"
    echo ""
    echo -e "${BLUE}Load Balanced Setup:${NC}"
    echo "- Chat Load Balancer: http://localhost:3001 (distributes to 3 instances)"
    echo "- API Gateway: http://localhost:5000"
    echo "- Group Service: http://localhost:3002"
    echo "- Message Service: http://localhost:3003"
    echo "- RabbitMQ Management: http://localhost:15672"
    echo ""
    echo -e "${YELLOW}💡 Your frontend should connect to: ws://localhost:3001${NC}"
    echo -e "${YELLOW}💡 Run './docker-start.sh health' to check chat instances${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ All services stopped!${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ All services restarted!${NC}"
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Showing logs for all services...${NC}"
        docker-compose logs -f
    else
        echo -e "${YELLOW}Showing logs for $1...${NC}"
        docker-compose logs -f "$1"
    fi
}

# Function to show status
show_status() {
    echo -e "${YELLOW}Service Status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}Chat Service Instances:${NC}"
    docker-compose ps | grep chat-service
}

# Function to build services
build_services() {
    echo -e "${YELLOW}Building all services...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ All services built!${NC}"
}

# Function to show scaling info
show_scaling_info() {
    echo -e "${BLUE}📊 Current Scaling Configuration:${NC}"
    echo ""
    echo "Chat Service Instances: 3"
    echo "  - chat-service-1: 512MB RAM, 0.5 CPU"
    echo "  - chat-service-2: 512MB RAM, 0.5 CPU" 
    echo "  - chat-service-3: 512MB RAM, 0.5 CPU"
    echo ""
    echo "Load Balancer: nginx with ip_hash (sticky sessions)"
    echo "Estimated Capacity: ~30,000-45,000 concurrent WebSocket connections"
    echo ""
    echo -e "${YELLOW}💡 To scale further:${NC}"
    echo "1. Add more chat-service instances to docker-compose.yml"
    echo "2. Update nginx.conf upstream section"
    echo "3. Increase resource limits if needed"
}

# Function to check health
check_health() {
    echo -e "${YELLOW}Checking health of chat service instances...${NC}"
    echo ""
    
    services=("chat-service-1" "chat-service-2" "chat-service-3")
    for service in "${services[@]}"; do
        echo -n "Checking $service: "
        if docker-compose exec -T "$service" wget --quiet --tries=1 --spider http://localhost:3001/health 2>/dev/null; then
            echo -e "${GREEN}✅ Healthy${NC}"
        else
            echo -e "${RED}❌ Unhealthy${NC}"
        fi
    done
    
    echo ""
    echo -n "Checking load balancer: "
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
}

# Function to clean up
clean_services() {
    echo -e "${RED}⚠️  This will stop and remove all containers and images!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cleaning up...${NC}"
        docker-compose down -v --rmi all
        echo -e "${GREEN}✅ Cleanup completed!${NC}"
    else
        echo "Cleanup cancelled."
    fi
}

# Main command handling
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    build)
        build_services
        ;;
    scale)
        show_scaling_info
        ;;
    health)
        check_health
        ;;
    clean)
        clean_services
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo -e "${RED}❌ No command specified${NC}"
        echo ""
        show_help
        exit 1
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac 