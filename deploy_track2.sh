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
if [[ -z "$GEMINI_API_KEY" ]]; then
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY not set, using default (may have rate limits)${NC}"
    echo -e "${BLUE}💡 Set GEMINI_API_KEY in .env for production use${NC}"
fi

# Track 2 uses session-based memory, no MongoDB setup needed
echo -e "${BLUE}🧠 Track 2 uses session-based conversation memory (no database required)${NC}"

# Deploy services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.track2.yml up --build -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 20

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check Traefik first
echo -e "${BLUE}🔍 Checking Traefik dashboard...${NC}"
if curl -f -s http://localhost:8082/api/rawdata > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Traefik is running${NC}"
else
    echo -e "${YELLOW}⚠️  Traefik dashboard not accessible${NC}"
fi

# Check chatbot service (main Track 2 service)
echo -e "${BLUE}🤖 Checking chatbot service...${NC}"
for i in {1..5}; do
    if curl -f -s http://chatbot.localhost:8002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Chatbot service is healthy${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Attempt $i/5: Waiting for chatbot service...${NC}"
        sleep 5
    fi
done

# Final health check
if ! curl -f -s http://chatbot.localhost:8002/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Chatbot service health check failed after 5 attempts${NC}"
    echo -e "${BLUE}📋 Checking chatbot logs...${NC}"
    docker-compose -f docker-compose.track2.yml logs --tail=20 chatbot
fi

# Show running services
echo -e "${BLUE}📊 Running services:${NC}"
docker-compose -f docker-compose.track2.yml ps

echo -e "${GREEN}🎉 Track 2 deployment completed!${NC}"
echo ""
echo -e "${BLUE}📍 Available endpoints:${NC}"
echo "  - Chatbot API: http://chatbot.localhost:8002"
echo "  - API Documentation: http://chatbot.localhost:8002/docs"
echo "  - Health Check: http://chatbot.localhost:8002/health"
echo "  - Traefik Dashboard: http://localhost:8082"
echo ""
echo -e "${BLUE}🌐 Frontend Integration:${NC}"
echo "  - Web: http://localhost:3000/chatbot (requires frontend running)"
echo "  - Mobile: Expo app /chatbot screen"
echo ""
echo -e "${BLUE}🤖 Chatbot Features:${NC}"
echo "  - RAG-powered responses with PDF document processing"
echo "  - Medical Decision Tree explanations"
echo "  - Multilingual support (English, Bassa, Duala, Ewondo)"
echo "  - DGH-specific medical knowledge (Malaria, Typhoid, etc.)"
echo "  - Conversation memory and context awareness"
echo ""
echo -e "${BLUE}🧪 Test the chatbot:${NC}"
echo "  curl -X POST http://chatbot.localhost:8002/chat \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"message\": \"What are the symptoms of malaria?\", \"session_id\": \"test\"}'"
