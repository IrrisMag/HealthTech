#!/bin/bash

# HealthTech Platform - Deployment Status Checker
# Check which tracks are currently deployed and accessible

echo "🏥 HealthTech Platform - Deployment Status Check"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Known deployment URLs from README
TRACK1_URL="https://track1-production.up.railway.app"
TRACK2_URL="https://healthtech-production-4917.up.railway.app"
TRACK3_URL="https://healthtech-production-e602.up.railway.app"

echo -e "${BLUE}📊 Checking current deployment status...${NC}"
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local endpoint=$3
    
    echo -n "  $service_name: "
    
    if curl -f -s "$url$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ONLINE${NC}"
        return 0
    else
        echo -e "${RED}❌ OFFLINE${NC}"
        return 1
    fi
}

# Check Track 1
echo -e "${BLUE}🏥 Track 1 - Patient Communication System${NC}"
echo "  URL: $TRACK1_URL"
check_service "Health Check" "$TRACK1_URL" "/health"
check_service "API Docs" "$TRACK1_URL" "/docs"
check_service "Auth Service" "$TRACK1_URL" "/api/auth/health"
check_service "Feedback Service" "$TRACK1_URL" "/api/feedback/health"
echo ""

# Check Track 2
echo -e "${BLUE}🤖 Track 2 - AI Medical Assistant${NC}"
echo "  URL: $TRACK2_URL"
check_service "Health Check" "$TRACK2_URL" "/health"
check_service "API Docs" "$TRACK2_URL" "/docs"
# Test chat endpoint with POST request
echo -n "  Chat Endpoint: "
if curl -X POST -s -f "$TRACK2_URL/chat" -H "Content-Type: application/json" -d '{"message":"test","session_id":"test"}' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ONLINE${NC}"
else
    echo -e "${RED}❌ OFFLINE${NC}"
fi
echo ""

# Check Track 3
echo -e "${BLUE}🩸 Track 3 - Blood Bank System${NC}"
echo "  URL: $TRACK3_URL"
check_service "Health Check" "$TRACK3_URL" "/health"
check_service "API Docs" "$TRACK3_URL" "/docs"
check_service "Dashboard Metrics" "$TRACK3_URL" "/dashboard/metrics"
check_service "Inventory" "$TRACK3_URL" "/inventory"
echo ""

# Check Frontend Deployments
echo -e "${BLUE}🌐 Frontend Deployments${NC}"
FRONTEND_URL="https://healthteh.netlify.app"
TRACK3_FRONTEND_URL="https://track3-blood-bank-dashboard.netlify.app"

echo "  Main UI: $FRONTEND_URL"
check_service "Main Frontend" "$FRONTEND_URL" ""

echo "  Track 3 Dashboard: $TRACK3_FRONTEND_URL"
check_service "Blood Bank Dashboard" "$TRACK3_FRONTEND_URL" ""
echo ""

# Summary
echo -e "${BLUE}📋 Deployment Summary${NC}"
echo "=================================================="
echo ""
echo -e "${GREEN}✅ Currently Deployed Services:${NC}"
echo "  🏥 Track 1 Backend: $TRACK1_URL"
echo "  🤖 Track 2 Backend: $TRACK2_URL"
echo "  🩸 Track 3 Backend: $TRACK3_URL"
echo "  🌐 Main Frontend: $FRONTEND_URL"
echo "  🩸 Track 3 Frontend: $TRACK3_FRONTEND_URL"
echo ""

echo -e "${BLUE}🔧 If any services are offline:${NC}"
echo "1. Check Railway dashboard for deployment status"
echo "2. Redeploy using the appropriate script:"
echo "   - ./deploy_track1_railway.sh"
echo "   - ./deploy_track2_railway.sh"
echo "   - ./deploy_track3_railway.sh"
echo "3. Or deploy all tracks: ./deploy_all_tracks_railway.sh"
echo ""

echo -e "${BLUE}📚 Quick Test Commands:${NC}"
echo "  # Test Track 1 Auth"
echo "  curl $TRACK1_URL/health"
echo ""
echo "  # Test Track 2 Chatbot"
echo "  curl -X POST $TRACK2_URL/chat \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\": \"Hello\", \"session_id\": \"test\"}'"
echo ""
echo "  # Test Track 3 Blood Bank"
echo "  curl $TRACK3_URL/dashboard/metrics"
echo ""

exit 0
