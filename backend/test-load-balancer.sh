#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Load Balancer Test Script${NC}"
echo "================================="

# Test if load balancer is responding
echo -e "${YELLOW}1. Testing Load Balancer Health...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Load balancer is responding${NC}"
else
    echo -e "${RED}❌ Load balancer is not responding${NC}"
    exit 1
fi

# Test multiple requests to see load distribution
echo -e "${YELLOW}2. Testing Load Distribution (10 requests)...${NC}"
for i in {1..10}; do
    response=$(curl -s http://localhost:3001/health)
    echo "Request $i: $response"
    sleep 0.5
done

# Test WebSocket connection capability
echo -e "${YELLOW}3. Testing WebSocket Upgrade Headers...${NC}"
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://localhost:3001/ 2>/dev/null | head -10

echo -e "${YELLOW}4. Checking Chat Service Instances...${NC}"
services=("chat-service-1" "chat-service-2" "chat-service-3")
healthy_count=0

for service in "${services[@]}"; do
    echo -n "Checking $service: "
    if docker-compose exec -T "$service" wget --quiet --tries=1 --spider http://localhost:3001/health 2>/dev/null; then
        echo -e "${GREEN}✅ Healthy${NC}"
        ((healthy_count++))
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
done

echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "Healthy chat instances: $healthy_count/3"

if [ $healthy_count -eq 3 ]; then
    echo -e "${GREEN}🎉 All systems operational! Load balancer is working correctly.${NC}"
    echo -e "${YELLOW}💡 Your frontend can connect to: ws://localhost:3001${NC}"
elif [ $healthy_count -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Some instances are down, but load balancer is still functional.${NC}"
else
    echo -e "${RED}❌ All chat instances are down!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔗 Test URLs:${NC}"
echo "- Health Check: http://localhost:3001/health"
echo "- WebSocket: ws://localhost:3001"
echo "- Load Balancer Stats: ./docker-start.sh logs chat-load-balancer" 