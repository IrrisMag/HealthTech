#!/bin/bash

# HealthTech Platform - Track 1 Deployment
# Services: Auth, Reminder, Feedback, Notification, Translation

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying HealthTech Track 1...${NC}"
echo -e "${BLUE}Services: Auth, Reminder, Feedback, Notification, Translation${NC}"

# Load environment variables if .env exists
if [[ -f ".env" ]]; then
    echo -e "${BLUE}📋 Loading environment variables from .env${NC}"
    source .env
else
    echo -e "${YELLOW}⚠️  No .env file found, using defaults${NC}"
fi

# Setup MongoDB if needed (optional)
if command -v python3 &> /dev/null && [[ -f "scripts/mongodb_manager.py" ]]; then
    echo -e "${BLUE}🗄️  Setting up MongoDB databases...${NC}"
    if python3 scripts/mongodb_manager.py --action setup --uri "${MONGODB_URI:-mongodb://localhost:27017}" 2>/dev/null; then
        echo -e "${GREEN}✅ MongoDB setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB setup skipped (pymongo not installed)${NC}"
    fi
fi

# Deploy services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.track1.yml up --build -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check auth service
if curl -f -s http://auth.localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Auth service health check failed${NC}"
fi

# Check other services
services=("reminder" "feedback" "notification" "translation")
for service in "${services[@]}"; do
    if curl -f -s http://${service}.localhost:8001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service^} service is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  ${service^} service health check failed${NC}"
    fi
done

# Show running services
echo -e "${BLUE}📊 Running services:${NC}"
docker-compose -f docker-compose.track1.yml ps

echo -e "${GREEN}🎉 Track 1 deployment completed!${NC}"
echo ""
echo -e "${BLUE}📍 Available endpoints:${NC}"
echo "  - 🌐 Feedback UI: http://ui.localhost:8001 (Main App)"
echo "  - 🔐 Auth: http://auth.localhost:8001"
echo "  - ⏰ Reminder: http://reminder.localhost:8001"
echo "  - 💬 Feedback API: http://feedback.localhost:8001"
echo "  - 📢 Notification: http://notification.localhost:8001"
echo "  - 🌍 Translation: http://translation.localhost:8001"
echo "  - 📊 Traefik Dashboard: http://localhost:8081"
echo ""
echo -e "${BLUE}🔐 Default admin credentials:${NC}"
echo "  Email: admin@hospital.com"
echo "  Password: admin123"
echo -e "${YELLOW}  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!${NC}"
