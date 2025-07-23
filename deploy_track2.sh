#!/bin/bash

# HealthTech Platform - Track 2 Deployment
# Services: Auth, Chatbot

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying HealthTech Track 2...${NC}"
echo -e "${BLUE}Services: Auth, Chatbot (AI/ML)${NC}"

# Load environment variables if .env exists
if [[ -f ".env" ]]; then
    echo -e "${BLUE}📋 Loading environment variables from .env${NC}"
    source .env
else
    echo -e "${YELLOW}⚠️  No .env file found, using defaults${NC}"
fi

# Check for AI/ML specific environment variables
if [[ -z "$OPENAI_API_KEY" ]]; then
    echo -e "${YELLOW}⚠️  OPENAI_API_KEY not set, chatbot may have limited functionality${NC}"
fi

# Setup MongoDB if needed
if command -v python3 &> /dev/null && [[ -f "scripts/mongodb_manager.py" ]]; then
    echo -e "${BLUE}🗄️  Setting up MongoDB databases...${NC}"
    python3 scripts/mongodb_manager.py --action setup --uri "${MONGODB_URI:-mongodb://localhost:27018}"
fi

# Deploy services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.track2.yml up --build -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check auth service
if curl -f -s http://auth-track2.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Auth service health check failed${NC}"
fi

# Check chatbot service
if curl -f -s http://chatbot.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Chatbot service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Chatbot service health check failed${NC}"
fi

# Show running services
echo -e "${BLUE}📊 Running services:${NC}"
docker-compose -f docker-compose.track2.yml ps

echo -e "${GREEN}🎉 Track 2 deployment completed!${NC}"
echo ""
echo -e "${BLUE}📍 Available endpoints:${NC}"
echo "  - Auth: http://auth-track2.localhost"
echo "  - Chatbot: http://chatbot.localhost"
echo "  - Traefik Dashboard: http://localhost:8081"
echo ""
echo -e "${BLUE}🔐 Default admin credentials:${NC}"
echo "  Email: admin@hospital.com"
echo "  Password: admin123"
echo -e "${YELLOW}  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!${NC}"
echo ""
echo -e "${BLUE}🤖 Chatbot Features:${NC}"
echo "  - Natural language processing"
echo "  - Medical query assistance"
echo "  - Multi-language support"
