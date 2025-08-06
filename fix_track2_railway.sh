#!/bin/bash

# Fix Track 2 Railway Deployment Script
# Addresses the FastAPI module not found error

set -e

echo "🔧 Fixing Track 2 Railway Deployment"
echo "🤖 AI Medical Assistant Chatbot System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo "Please install Railway CLI first:"
    echo "npm install -g @railway/cli"
    echo "or visit: https://railway.app/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Please login first:"
    echo "railway login"
    exit 1
fi

echo -e "${BLUE}🔍 Diagnosing the issue...${NC}"
echo "  - Issue: ModuleNotFoundError: No module named 'fastapi'"
echo "  - Cause: Dependencies not being installed properly"
echo "  - Solution: Using correct Dockerfile and requirements"
echo ""

# Navigate to chatbot directory
cd chatbot

echo -e "${BLUE}📦 Preparing fixed deployment...${NC}"

# Verify files exist
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt not found!${NC}"
    exit 1
fi

if [ ! -f "Dockerfile.railway" ]; then
    echo -e "${RED}❌ Dockerfile.railway not found!${NC}"
    exit 1
fi

if [ ! -f "main.py" ]; then
    echo -e "${RED}❌ main.py not found!${NC}"
    exit 1
fi

echo "  ✅ requirements.txt found"
echo "  ✅ Dockerfile.railway found"
echo "  ✅ main.py found"
echo "  ✅ railway.toml configured"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  - Service: Track 2 AI Medical Assistant"
echo "  - Framework: FastAPI + Python 3.11"
echo "  - Dockerfile: Dockerfile.railway"
echo "  - Dependencies: Updated requirements.txt"
echo "  - Entry Point: main:app via uvicorn"
echo ""

echo -e "${BLUE}🚀 Redeploying to Railway...${NC}"

# Deploy to Railway
railway up --detach

echo ""
echo -e "${GREEN}✅ Redeployment initiated!${NC}"
echo ""
echo -e "${BLUE}📊 Monitoring deployment...${NC}"

# Wait a moment for deployment to start
sleep 5

# Check deployment status
echo "Checking deployment status..."
railway logs --tail 20

echo ""
echo -e "${BLUE}🔧 Troubleshooting Tips:${NC}"
echo "1. If still failing, check Railway dashboard for detailed logs"
echo "2. Verify environment variables are set:"
echo "   - GOOGLE_API_KEY (required for AI functionality)"
echo "   - PORT (should be set automatically by Railway)"
echo ""
echo "3. Test endpoints after deployment:"
echo "   - GET /health (health check)"
echo "   - GET /docs (API documentation)"
echo "   - POST /chat (chatbot endpoint)"
echo ""

# Try to get the service URL
echo -e "${BLUE}🌐 Service Information:${NC}"
if railway status &> /dev/null; then
    echo "  Status: $(railway status 2>/dev/null | head -1 || echo 'Deploying...')"
    
    # Try to get domain
    DOMAIN=$(railway domain 2>/dev/null || echo "Domain will be available after deployment")
    echo "  URL: $DOMAIN"
    
    if [[ $DOMAIN != *"Domain will be available"* ]]; then
        echo ""
        echo -e "${GREEN}🎉 Track 2 Backend Endpoints:${NC}"
        echo "  📊 Health Check: $DOMAIN/health"
        echo "  📚 API Docs: $DOMAIN/docs"
        echo "  🤖 Chat Endpoint: $DOMAIN/chat"
        echo "  🧠 Clear Memory: $DOMAIN/clear-memory"
    fi
else
    echo "  Status: Initializing..."
fi

echo ""
echo -e "${GREEN}🔧 Track 2 fix deployment complete!${NC}"
echo -e "${YELLOW}⚠️  Monitor the logs to ensure successful startup${NC}"
echo ""

# Return to original directory
cd ..

exit 0
