#!/bin/bash

# Track 2 Railway Deployment Script
# AI Medical Assistant Chatbot System

set -e

echo "🤖 Track 2 - AI Medical Assistant"
echo "🚀 Deploying to Railway..."
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

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  - Service: Track 2 AI Medical Assistant"
echo "  - Framework: FastAPI + Python 3.11"
echo "  - Features: RAG Chatbot, Medical Knowledge, Multilingual"
echo "  - AI: Google Gemini API"
echo ""

# Navigate to chatbot directory
cd chatbot

echo -e "${BLUE}📦 Preparing deployment files...${NC}"

echo "  ✅ Using Dockerfile.track2"

# Create railway.toml for Track 2
cat > railway.toml << EOF
[build]
builder = "DOCKERFILE"
dockerfilePath = "../Dockerfile.track2"

[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/health"
healthcheckTimeout = 300

[environments.production.variables]
ENVIRONMENT = "production"
LOG_LEVEL = "INFO"
PORT = "8000"
EOF

echo "  ✅ Created railway.toml"

# Initialize Railway project if needed
if [ ! -f .railway ]; then
    echo -e "${YELLOW}🔧 Initializing Railway project...${NC}"
    railway init
fi

echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Deploy to Railway
railway up --detach

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""
echo -e "${BLUE}📊 Next Steps:${NC}"
echo "1. Configure environment variables in Railway dashboard:"
echo "   - GOOGLE_API_KEY (Google Gemini API key)"
echo "   - MONGODB_URI (MongoDB connection string - optional)"
echo "   - JWT_SECRET (for authentication)"
echo ""
echo "2. Check deployment status:"
echo "   railway status"
echo ""
echo "3. View logs:"
echo "   railway logs"
echo ""
echo "4. Get service URL:"
echo "   railway domain"
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
        echo "  📄 Document Upload: $DOMAIN/upload-document"
    fi
else
    echo "  Status: Initializing..."
fi

echo ""
echo -e "${GREEN}🤖 Track 2 Backend deployment complete!${NC}"
echo -e "${YELLOW}⚠️  Remember to configure Google API key and environment variables${NC}"
echo ""

# Return to original directory
cd ..

exit 0
