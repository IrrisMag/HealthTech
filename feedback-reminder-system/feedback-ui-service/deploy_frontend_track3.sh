#!/bin/bash

# 🎯 Frontend Track 3 Integration Deployment Script
# This script deploys the enhanced frontend with Track 3 integration

echo "🚀 Starting Frontend Track 3 Integration Deployment..."
echo "=================================================="

# Set environment variables
export NEXT_PUBLIC_TRACK3_API_URL="https://healthtech-production-e602.up.railway.app"
export NEXT_PUBLIC_TRACK1_API_URL="https://track1-production.up.railway.app"
export NEXT_PUBLIC_TRACK2_API_URL="https://healthtech-production-4917.up.railway.app"

echo "✅ Environment variables set:"
echo "   - Track 3 API: $NEXT_PUBLIC_TRACK3_API_URL"
echo "   - Track 1 API: $NEXT_PUBLIC_TRACK1_API_URL"
echo "   - Track 2 API: $NEXT_PUBLIC_TRACK2_API_URL"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Add missing dependencies if needed
echo ""
echo "🔧 Adding UI component dependencies..."
npm install @radix-ui/react-tabs class-variance-authority

# Build the application
echo ""
echo "🏗️ Building application..."
npm run build

# Export static files
echo ""
echo "📤 Exporting static files..."
npm run export

echo ""
echo "✅ Frontend Track 3 Integration Deployment Complete!"
echo "=================================================="
echo ""
echo "🎯 New Features Available:"
echo "   - Blood Bank Dashboard (/blood-bank)"
echo "   - Enhanced Analytics (/analytics)"
echo "   - Real-time Track 3 data integration"
echo "   - DHIS2 connection status"
echo "   - AI forecasting and optimization"
echo ""
echo "🌐 Ready for deployment to:"
echo "   - Netlify"
echo "   - Vercel"
echo "   - Railway"
echo "   - Any static hosting service"
echo ""
echo "📁 Static files available in: ./out/"
echo ""
echo "🎉 Frontend successfully enhanced with Track 3 integration!"
