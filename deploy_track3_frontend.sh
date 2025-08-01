#!/bin/bash

# Track 3 Frontend Netlify Deployment Script
# Blood Bank Dashboard - React.js + Next.js

set -e

echo "🩸 Track 3 Frontend - Blood Bank Dashboard"
echo "🚀 Deploying to Netlify..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${RED}❌ Netlify CLI not found!${NC}"
    echo "Please install Netlify CLI first:"
    echo "npm install -g netlify-cli"
    echo "or visit: https://docs.netlify.com/cli/get-started/"
    exit 1
fi

# Check if user is logged in
if ! netlify status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Netlify${NC}"
    echo "Please login first:"
    echo "netlify login"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  - Frontend: Track 3 Blood Bank Dashboard"
echo "  - Framework: React.js + Next.js 14"
echo "  - Features: D3.js visualizations, real-time monitoring"
echo "  - Backend: Railway (https://healthtech-production-e602.up.railway.app)"
echo ""

# Navigate to the dashboard directory
cd tracks/track3/dashboard

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔧 Building for production...${NC}"
npm run build

echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"

# Deploy to Netlify
netlify deploy --prod --dir=out --message="Track 3 Blood Bank Dashboard - Production Deployment"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📊 Dashboard Features:${NC}"
echo "  ✅ Real-time blood inventory monitoring"
echo "  ✅ ARIMA/XGBoost demand forecasting"
echo "  ✅ AI-powered optimization recommendations"
echo "  ✅ Interactive D3.js visualizations"
echo "  ✅ Responsive design for all devices"
echo "  ✅ Connected to Railway backend"
echo ""

# Try to get the site URL
echo -e "${BLUE}🌐 Site Information:${NC}"
SITE_URL=$(netlify status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d'"' -f4 || echo "")

if [[ -n "$SITE_URL" ]]; then
    echo "  🩸 Blood Bank Dashboard: $SITE_URL"
    echo ""
    echo -e "${GREEN}🎉 Track 3 Frontend Endpoints:${NC}"
    echo "  📊 Main Dashboard: $SITE_URL"
    echo "  📦 Inventory Management: $SITE_URL/inventory"
    echo "  📈 Demand Forecasting: $SITE_URL/forecasting"
    echo "  ⚡ AI Optimization: $SITE_URL/optimization"
    echo "  📋 Reports & Analytics: $SITE_URL/reports"
else
    echo "  Status: Deployed successfully"
    echo "  Run 'netlify open' to view your site"
fi

echo ""
echo -e "${GREEN}🩸 Track 3 Frontend deployment complete!${NC}"
echo -e "${BLUE}💡 The dashboard is now connected to the live Railway backend${NC}"
echo ""

# Return to original directory
cd ../../..

exit 0
