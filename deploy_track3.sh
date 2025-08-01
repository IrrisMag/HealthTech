#!/bin/bash

# HealthTech Platform - Track 3 Deployment
# AI-Enhanced Blood Bank Stock Monitoring and Forecasting System
# Services: Auth, Data Ingestion, Forecasting, Optimization, Dashboard

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🩸 Deploying HealthTech Track 3 - AI-Enhanced Blood Bank System...${NC}"
echo -e "${BLUE}Services: Data Ingestion, Forecasting, Optimization, Dashboard${NC}"

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
sleep 45

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check auth service
if curl -f -s http://auth-track3.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Auth service health check failed${NC}"
fi

# Check data ingestion service
if curl -f -s http://data-track3.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Data Ingestion service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Data Ingestion service health check failed${NC}"
fi

# Check forecasting service
if curl -f -s http://forecast-track3.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Forecasting service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Forecasting service health check failed${NC}"
fi

# Check optimization service
if curl -f -s http://optimization-track3.localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Optimization service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Optimization service health check failed${NC}"
fi

# Check dashboard
if curl -f -s http://dashboard-track3.localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Blood Bank Dashboard is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Blood Bank Dashboard health check failed${NC}"
fi

# Show running services
echo -e "${BLUE}📊 Running services:${NC}"
docker-compose -f docker-compose.track3.yml ps

echo -e "${GREEN}🎉 Track 3 deployment completed!${NC}"
echo ""
echo -e "${BLUE}🩸 Blood Bank System Endpoints:${NC}"
echo "  🔐 Auth Service: http://auth-track3.localhost"
echo "  📊 Data Ingestion: http://data-track3.localhost"
echo "  📈 Forecasting API: http://forecast-track3.localhost"
echo "  ⚡ Optimization API: http://optimization-track3.localhost"
echo "  🩸 Blood Bank Dashboard: http://dashboard-track3.localhost"
echo "  🔍 Traefik Dashboard: http://localhost:8082"
echo ""
echo -e "${BLUE}📚 API Documentation:${NC}"
echo "  📊 Data API Docs: http://data-track3.localhost/docs"
echo "  📈 Forecast API Docs: http://forecast-track3.localhost/docs"
echo "  ⚡ Optimization API Docs: http://optimization-track3.localhost/docs"
echo ""
echo -e "${BLUE}🔐 Default admin credentials:${NC}"
echo "  Email: admin@hospital.com"
echo "  Password: admin123"
echo -e "${YELLOW}  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!${NC}"
echo ""
echo -e "${BLUE}🩸 Blood Bank Features:${NC}"
echo "  - Real-time inventory monitoring"
echo "  - ARIMA/XGBoost demand forecasting"
echo "  - AI-powered optimization recommendations"
echo "  - DHIS2 integration for data exchange"
echo "  - Interactive D3.js dashboard visualizations"
echo "  - PuLP/SciPy optimization algorithms"
echo ""
echo -e "${GREEN}🏥 Ready for blood bank operations at Douala General Hospital!${NC}"
