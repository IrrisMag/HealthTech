#!/bin/bash

# Track 3 Railway Deployment Script
# AI-Enhanced Blood Bank System Backend

set -e

echo "🩸 Track 3 - AI-Enhanced Blood Bank System"
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
echo "  - Service: Track 3 Blood Bank Backend"
echo "  - Framework: FastAPI + Python 3.11"
echo "  - Features: Data Ingestion, Forecasting, Optimization"
echo "  - Database: MongoDB (will be configured)"
echo ""

# Navigate to the track3-backend directory
cd feedback-reminder-system/track3-backend

echo -e "${BLUE}📦 Preparing deployment files...${NC}"

# Create .railwayignore if it doesn't exist
if [ ! -f .railwayignore ]; then
    cat > .railwayignore << EOF
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git/
.mypy_cache/
.pytest_cache/
.hypothesis/
.DS_Store
*.sqlite3
*.db
.env
.env.local
.env.*.local
node_modules/
*.md
EOF
    echo "  ✅ Created .railwayignore"
fi

# Create or update railway.toml
cat > railway.toml << EOF
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

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
echo "   - DATABASE_NAME (default: bloodbank)"
echo "   - JWT_SECRET (for authentication)"
echo ""
echo "2. Add MongoDB service:"
echo "   railway add mongodb"
echo ""
echo "3. Check deployment status:"
echo "   railway status"
echo ""
echo "4. View logs:"
echo "   railway logs"
echo ""
echo "5. Get service URL:"
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
        echo -e "${GREEN}🎉 Track 3 Backend Endpoints:${NC}"
        echo "  📊 Health Check: $DOMAIN/health"
        echo "  📚 API Docs: $DOMAIN/docs"
        echo "  🩸 Dashboard Metrics: $DOMAIN/dashboard/metrics"
        echo "  📦 Inventory: $DOMAIN/inventory"
        echo "  📈 Forecasting: $DOMAIN/forecast/{blood_type}?periods=7"
        echo "  ⚡ Optimization: $DOMAIN/recommendations/active"
    fi
else
    echo "  Status: Initializing..."
fi

echo ""
echo -e "${GREEN}🩸 Track 3 Backend deployment complete!${NC}"
echo -e "${YELLOW}⚠️  Remember to configure MongoDB and environment variables${NC}"
echo ""

# Return to original directory
cd ../..

exit 0
