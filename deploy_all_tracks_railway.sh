#!/bin/bash

# HealthTech Platform - Deploy All Tracks to Railway
# Comprehensive deployment script for all three tracks

set -e

echo "🏥 HealthTech Platform - Complete Railway Deployment"
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
echo "  🏥 Track 1: Patient Communication System"
echo "  🤖 Track 2: AI Medical Assistant"
echo "  🩸 Track 3: Blood Bank Management System"
echo ""

# Function to deploy a track
deploy_track() {
    local track_num=$1
    local track_name=$2
    local script_name=$3
    
    echo -e "${BLUE}🚀 Deploying Track $track_num - $track_name${NC}"
    echo "=================================================="
    
    if [[ -f "$script_name" ]]; then
        chmod +x "$script_name"
        ./"$script_name"
        echo ""
        echo -e "${GREEN}✅ Track $track_num deployment completed!${NC}"
    else
        echo -e "${RED}❌ Deployment script $script_name not found!${NC}"
        exit 1
    fi
    
    echo ""
    echo "Press Enter to continue with next track..."
    read
}

# Deploy Track 1
deploy_track "1" "Patient Communication System" "deploy_track1_railway.sh"

# Deploy Track 2
deploy_track "2" "AI Medical Assistant" "deploy_track2_railway.sh"

# Deploy Track 3
deploy_track "3" "Blood Bank Management System" "deploy_track3_railway.sh"

echo ""
echo -e "${GREEN}🎉 All tracks deployed successfully!${NC}"
echo "=================================================="
echo ""

# Collect deployment URLs
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo ""

# Try to get URLs for each track
echo -e "${BLUE}🌐 Service URLs:${NC}"

# Note: You'll need to run these commands in each track's directory
echo "  🏥 Track 1: Run 'railway domain' in Track 1 project"
echo "  🤖 Track 2: Run 'railway domain' in Track 2 project"
echo "  🩸 Track 3: Run 'railway domain' in Track 3 project"
echo ""

echo -e "${BLUE}📚 Next Steps:${NC}"
echo "1. Configure environment variables for each track:"
echo ""
echo "   🏥 Track 1 Environment Variables:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN"
echo "   - TWILIO_PHONE_NUMBER"
echo ""
echo "   🤖 Track 2 Environment Variables:"
echo "   - GOOGLE_API_KEY"
echo "   - MONGODB_URI (optional)"
echo "   - JWT_SECRET"
echo ""
echo "   🩸 Track 3 Environment Variables:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - DHIS2_BASE_URL"
echo "   - DHIS2_USERNAME"
echo "   - DHIS2_PASSWORD"
echo ""
echo "2. Update frontend environment variables with new URLs"
echo "3. Test all endpoints and functionality"
echo "4. Configure custom domains (optional)"
echo ""

echo -e "${BLUE}🧪 Health Check Commands:${NC}"
echo "  curl https://track1-url/health"
echo "  curl https://track2-url/health"
echo "  curl https://track3-url/health"
echo ""

echo -e "${BLUE}📚 API Documentation:${NC}"
echo "  Track 1: https://track1-url/docs"
echo "  Track 2: https://track2-url/docs"
echo "  Track 3: https://track3-url/docs"
echo ""

echo -e "${GREEN}🏥 HealthTech Platform deployment complete!${NC}"
echo -e "${YELLOW}⚠️  Remember to configure environment variables for all tracks${NC}"
echo ""

exit 0
