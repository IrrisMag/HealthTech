#!/bin/bash

# HealthTech Platform - Track 3 Deployment
# Services: Auth, Analysis, Data

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying HealthTech Track 3...${NC}"
echo -e "${BLUE}Services: Auth, Analysis, Data Management${NC}"

# Load environment variables if .env exists
if [[ -f ".env" ]]; then
    echo -e "${BLUE}📋 Loading environment variables from .env${NC}"
    source .env
else
    echo -e "${YELLOW}⚠️  No .env file found, using defaults${NC}"
fi

# Setup MongoDB if needed
if command -v python3 &> /dev/null && [[ -f "scripts/mongodb_manager.py" ]]; then
    echo -e "${BLUE}🗄️  Setting up MongoDB databases...${NC}"
    python3 scripts/mongodb_manager.py --action setup --uri "${MONGODB_URI:-mongodb://localhost:27019}"
fi

# Deploy services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.track3.yml up --build -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check auth service
if curl -f -s http://auth-track3.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Auth service health check failed${NC}"
fi

# Check analysis service
if curl -f -s http://analysis.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Analysis service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Analysis service health check failed${NC}"
fi

# Check data service
if curl -f -s http://data.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Data service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Data service health check failed${NC}"
fi

# Show running services
echo -e "${BLUE}📊 Running services:${NC}"
docker-compose -f docker-compose.track3.yml ps

echo -e "${GREEN}🎉 Track 3 deployment completed!${NC}"
echo ""
echo -e "${BLUE}📍 Available endpoints:${NC}"
echo "  - Auth: http://auth-track3.localhost"
echo "  - Analysis: http://analysis.localhost"
echo "  - Data: http://data.localhost"
echo "  - Traefik Dashboard: http://localhost:8082"
echo ""
echo -e "${BLUE}🔐 Default admin credentials:${NC}"
echo "  Email: admin@hospital.com"
echo "  Password: admin123"
echo -e "${YELLOW}  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!${NC}"
echo ""
echo -e "${BLUE}📊 Analytics Features:${NC}"
echo "  - Health data analysis"
echo "  - Predictive modeling"
echo "  - Data visualization"
echo "  - Secure data management"
