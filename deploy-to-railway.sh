#!/bin/bash

# HealthTech Railway Deployment Script with Auto Environment Variables
echo "🚀 HealthTech Railway Deployment Script"
echo "========================================"

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found! Please ensure .env exists in the current directory."
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Please login to Railway..."
railway login

# Deploy Track 2 (AI Chatbot)
echo ""
echo "🤖 Deploying Track 2 - AI Medical Assistant..."
echo "Creating new Railway project for Track 2..."

# Create project for Track 2
railway new healthtech-track2

# Set environment variables for Track 2
echo "🔧 Setting environment variables for Track 2..."
railway variables set GOOGLE_API_KEY="$GEMINI_API_KEY"
railway variables set MONGODB_URI="$MONGODB_CLUSTER_URI"
railway variables set DB_NAME="$DB_NAME_CHATBOT"
railway variables set ENVIRONMENT="production"
railway variables set LOG_LEVEL="$LOG_LEVEL"
railway variables set CHUNK_SIZE="$CHUNK_SIZE"
railway variables set CHUNK_OVERLAP="$CHUNK_OVERLAP"
railway variables set MAX_TOKENS="$MAX_TOKENS"
railway variables set TEMPERATURE="$TEMPERATURE"

# Deploy Track 2
echo "📤 Deploying Track 2..."
railway up --dockerfile Dockerfile.railway.track2

echo ""
echo "✅ Track 2 deployed with environment variables automatically set!"

# Get Track 2 URL
TRACK2_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "Check Railway dashboard for URL")
echo "🌐 Track 2 URL: $TRACK2_URL"

echo ""
echo "Press Enter to continue with Track 1 deployment..."
read

# Deploy Track 1 (Patient Communication)
echo ""
echo "🏥 Deploying Track 1 - Patient Communication System..."
echo "Creating new Railway project for Track 1..."

# Create project for Track 1
railway new healthtech-track1

# Set environment variables for Track 1
echo "🔧 Setting environment variables for Track 1..."
railway variables set MONGODB_URI="$MONGODB_CLUSTER_URI"
railway variables set DB_NAME_AUTH="$DB_NAME_AUTH"
railway variables set DB_NAME_FEEDBACK="$DB_NAME_FEEDBACK"
railway variables set DB_NAME_REMINDER="$DB_NAME_REMINDER"
railway variables set DB_NAME_NOTIFICATION="$DB_NAME_NOTIFICATION"
railway variables set DB_NAME_TRANSLATION="$DB_NAME_TRANSLATION"
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_ALGORITHM="$JWT_ALGORITHM"
railway variables set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID"
railway variables set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"
railway variables set TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER"
railway variables set ENVIRONMENT="production"
railway variables set LOG_LEVEL="$LOG_LEVEL"

# Deploy Track 1
echo "📤 Deploying Track 1..."
railway up --dockerfile Dockerfile.railway.track1

echo ""
echo "✅ Track 1 deployed with environment variables automatically set!"

# Get Track 1 URL
TRACK1_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "Check Railway dashboard for URL")
echo "🌐 Track 1 URL: $TRACK1_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📋 Judge Access URLs:"
echo "   Track 1 (Patient System): $TRACK1_URL"
echo "   Track 2 (AI Chatbot): $TRACK2_URL/chatbot"
echo ""
echo "📱 Mobile App QR Code: $TRACK2_URL/mobile"
echo ""
echo "✅ Environment Variables Automatically Set:"
echo "   ✓ MongoDB URI: $MONGODB_CLUSTER_URI"
echo "   ✓ Google AI API Key: ${GEMINI_API_KEY:0:20}..."
echo "   ✓ JWT Secret: ${JWT_SECRET:0:20}..."
echo "   ✓ Twilio Configuration: ${TWILIO_PHONE_NUMBER}"
echo ""
echo "🧪 Test Commands:"
echo "   curl $TRACK2_URL/health"
echo "   curl $TRACK1_URL/health"
echo ""
echo "📚 API Documentation:"
echo "   Track 1: $TRACK1_URL/docs"
echo "   Track 2: $TRACK2_URL/docs"
echo ""
echo "💡 Need help? Check the deployment guide: deployment/FREE_HOSTING_GUIDE.md"
