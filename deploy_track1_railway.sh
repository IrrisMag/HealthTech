#!/bin/bash

# Track 1 Railway Deployment Script
# Patient Communication System (Auth, Feedback, Reminder, Notification, Translation)

set -e

echo "🏥 Track 1 - Patient Communication System"
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
echo "  - Service: Track 1 Patient Communication System"
echo "  - Framework: FastAPI + Python 3.11"
echo "  - Features: Auth, Feedback, Reminder, Notification, Translation"
echo "  - Database: MongoDB (will be configured)"
echo ""

echo -e "${BLUE}📦 Using existing Dockerfile.railway.track1...${NC}"

# Create railway.toml for Track 1
cat > railway.toml << EOF
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway.track1"

[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

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
echo "   - MONGODB_URI (MongoDB connection string)"
echo "   - JWT_SECRET (for authentication)"
echo "   - TWILIO_ACCOUNT_SID (for SMS notifications)"
echo "   - TWILIO_AUTH_TOKEN (for SMS notifications)"
echo "   - TWILIO_PHONE_NUMBER (for SMS notifications)"
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
        echo -e "${GREEN}🎉 Track 1 Backend Endpoints:${NC}"
        echo "  📊 Health Check: $DOMAIN/health"
        echo "  📚 API Docs: $DOMAIN/docs"
        echo "  🔐 Authentication: $DOMAIN/api/auth"
        echo "  💬 Feedback: $DOMAIN/api/feedback"
        echo "  ⏰ Reminders: $DOMAIN/api/reminder"
        echo "  📢 Notifications: $DOMAIN/api/notification"
        echo "  🌍 Translation: $DOMAIN/api/translation"
    fi
else
    echo "  Status: Initializing..."
fi

echo ""
echo -e "${GREEN}🏥 Track 1 Backend deployment complete!${NC}"
echo -e "${YELLOW}⚠️  Remember to configure MongoDB and environment variables${NC}"
echo ""

exit 0
