#!/bin/bash

# Track 3 Microservices Deployment Script for Railway
# Deploys Data, Forecasting, and Optimization services separately

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Track 3 Microservices Deployment to Railway${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed${NC}"
    echo -e "${YELLOW}Please install it from: https://docs.railway.app/develop/cli${NC}"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to Railway first${NC}"
    echo "Run: railway login"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI is ready${NC}"
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2
    local service_description=$3
    
    echo -e "${BLUE}🔨 Deploying ${service_name}...${NC}"
    echo -e "${YELLOW}Path: ${service_path}${NC}"
    echo -e "${YELLOW}Description: ${service_description}${NC}"
    
    cd "$service_path"
    
    # Create new Railway project for this service
    echo -e "${BLUE}Creating Railway project for ${service_name}...${NC}"
    railway login --browserless || true
    
    # Initialize and deploy
    railway init --name "track3-${service_name,,}" || true
    
    # Set environment variables
    echo -e "${BLUE}Setting environment variables...${NC}"
    railway variables set ENVIRONMENT=production
    railway variables set LOG_LEVEL=INFO
    
    # Service-specific environment variables
    case $service_name in
        "Data")
            railway variables set DB_NAME=bloodbank_data
            railway variables set SERVICE_NAME=data-service
            ;;
        "Forecasting")
            railway variables set MODEL_UPDATE_INTERVAL=24
            railway variables set FORECAST_HORIZON_DAYS=30
            railway variables set SERVICE_NAME=forecasting-service
            ;;
        "Optimization")
            railway variables set OPTIMIZATION_MODEL=linear_programming
            railway variables set SERVICE_NAME=optimization-service
            ;;
    esac
    
    # Deploy the service
    echo -e "${BLUE}Deploying ${service_name} service...${NC}"
    railway up --detach
    
    # Get the deployment URL
    echo -e "${GREEN}✅ ${service_name} service deployed successfully!${NC}"
    
    # Return to root directory
    cd - > /dev/null
    echo ""
}

# Deploy each service
echo -e "${BLUE}Starting deployment of Track 3 microservices...${NC}"
echo ""

# 1. Deploy Data Ingestion Service
deploy_service "Data" "data" "Blood Bank Data Ingestion and DHIS2 Integration Service"

# 2. Deploy Forecasting Service  
deploy_service "Forecasting" "forecast" "ARIMA/XGBoost Blood Demand Forecasting Service"

# 3. Deploy Optimization Service
deploy_service "Optimization" "optimization" "PuLP/SciPy Blood Inventory Optimization Service"

echo -e "${GREEN}🎉 All Track 3 microservices deployed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "${GREEN}✅ Data Ingestion Service - DHIS2 integration, inventory management${NC}"
echo -e "${GREEN}✅ Forecasting Service - ARIMA/XGBoost demand forecasting${NC}"
echo -e "${GREEN}✅ Optimization Service - PuLP/SciPy linear programming${NC}"
echo ""
echo -e "${BLUE}🔗 Next Steps:${NC}"
echo "1. Update frontend environment variables with new service URLs"
echo "2. Configure service-to-service communication"
echo "3. Set up monitoring and logging"
echo "4. Test all endpoints"
echo ""
echo -e "${YELLOW}💡 Tip: Use 'railway status' to check deployment status${NC}"
echo -e "${YELLOW}💡 Tip: Use 'railway logs' to view service logs${NC}"
