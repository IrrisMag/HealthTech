#!/bin/bash

# HealthTech Platform - Deploy All Backend Services to Railway
# This script deploys Track 1, Track 2, and Track 3 as separate Railway services

set -e

echo "🏥 HealthTech Platform - Backend Deployment"
echo "🚀 Deploying all three tracks to Railway..."
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

echo -e "${BLUE}📋 Deployment Plan:${NC}"
echo "  🏥 Track 1: Patient Communication System (separate deployment)"
echo "  🤖 Track 2: AI Medical Assistant (separate deployment)"
echo "  🩸 Track 3: Blood Bank System (separate deployment)"
echo ""

# Function to deploy a track
deploy_track() {
    local track_num=$1
    local track_name=$2
    local dockerfile=$3
    local project_name=$4
    
    echo -e "${BLUE}🚀 Deploying Track $track_num - $track_name${NC}"
    echo "=================================================="
    
    # Create new Railway project
    echo -e "${YELLOW}🔧 Creating Railway project: $project_name${NC}"
    railway new "$project_name" || echo "Project may already exist"
    
    # Create railway.toml
    cat > railway.toml << EOF
[build]
builder = "DOCKERFILE"
dockerfilePath = "$dockerfile"

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
    
    echo -e "${BLUE}📦 Deploying with $dockerfile...${NC}"
    
    # Deploy to Railway
    railway up --detach
    
    echo -e "${GREEN}✅ Track $track_num deployment initiated!${NC}"
    
    # Try to get the service URL
    echo -e "${BLUE}🌐 Getting service URL...${NC}"
    sleep 5
    
    DOMAIN=$(railway domain 2>/dev/null || echo "Domain will be available after deployment")
    echo "  URL: $DOMAIN"
    
    echo ""
    echo "Press Enter to continue with next track..."
    read
}

# Deploy Track 1 - Patient Communication System
echo -e "${BLUE}Starting Track 1 deployment...${NC}"
deploy_track "1" "Patient Communication System" "Dockerfile.railway.track1" "healthtech-track1-backend"

# Deploy Track 2 - AI Medical Assistant
echo -e "${BLUE}Starting Track 2 deployment...${NC}"
deploy_track "2" "AI Medical Assistant" "Dockerfile.track2" "healthtech-track2-chatbot"

# Deploy Track 3 - Blood Bank System
echo -e "${BLUE}Starting Track 3 deployment...${NC}"
deploy_track "3" "Blood Bank System" "Dockerfile.track3" "healthtech-track3-bloodbank"

echo ""
echo -e "${GREEN}🎉 All backend deployments completed!${NC}"
echo "=================================================="
echo ""

echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  🏥 Track 1: Patient Communication System"
echo "  🤖 Track 2: AI Medical Assistant"
echo "  🩸 Track 3: Blood Bank System"
echo ""

echo -e "${BLUE}📚 Next Steps:${NC}"
echo "1. Configure environment variables for each track in Railway dashboard"
echo "2. Wait for deployments to complete (5-10 minutes each)"
echo "3. Test all endpoints using the health check script"
echo "4. Update frontend environment variables with new URLs"
echo ""

echo -e "${BLUE}🔧 Required Environment Variables:${NC}"
echo ""
echo "  🏥 Track 1:"
echo "    - MONGODB_URI"
echo "    - JWT_SECRET"
echo "    - TWILIO_ACCOUNT_SID"
echo "    - TWILIO_AUTH_TOKEN"
echo "    - TWILIO_PHONE_NUMBER"
echo ""
echo "  🤖 Track 2:"
echo "    - GOOGLE_API_KEY"
echo "    - JWT_SECRET"
echo ""
echo "  🩸 Track 3:"
echo "    - MONGODB_URI"
echo "    - JWT_SECRET"
echo "    - DHIS2_BASE_URL"
echo "    - DHIS2_USERNAME"
echo "    - DHIS2_PASSWORD"
echo ""

echo -e "${BLUE}🧪 Test Commands (after deployment):${NC}"
echo "  ./check_deployment_status.sh"
echo ""

echo -e "${GREEN}🏥 Backend deployment process complete!${NC}"
echo -e "${YELLOW}⚠️  Remember to configure environment variables for all tracks${NC}"
echo ""

exit 0
