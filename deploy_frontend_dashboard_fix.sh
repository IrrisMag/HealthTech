#!/bin/bash

# Deploy Frontend Dashboard Fix
# Updates Track 1 & Track 2 frontend with unified role-based dashboard

set -e

echo "🔧 Deploying Frontend Dashboard Fix"
echo "🏥 HealthTech Platform - Unified Dashboard"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to frontend directory
cd feedback-reminder-system/feedback-ui-service

echo -e "${BLUE}📋 Dashboard Fix Summary:${NC}"
echo "  ✅ Unified dashboard with role-based features"
echo "  ✅ Single /dashboard route for all users"
echo "  ✅ Role-based feature visibility"
echo "  ✅ Proper login redirection"
echo "  ✅ Updated AuthProvider logic"
echo ""

echo -e "${BLUE}📦 Building updated frontend...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building Next.js application..."
npm run build

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""

echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    echo "Deploying with Netlify CLI..."
    netlify deploy --prod --dir=out
    
    echo -e "${GREEN}✅ Deployment completed!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Frontend URLs:${NC}"
    echo "  Track 1 & 2: https://healthtech-tracks-1-2.netlify.app"
    echo ""
    echo -e "${BLUE}🎯 Dashboard Features by Role:${NC}"
    echo "  👑 Admin: All features + user management + analytics"
    echo "  👨‍⚕️ Doctor: Chatbot + feedback + reminders + analytics"
    echo "  👩‍⚕️ Nurse: Patient registration + feedback + reminders + notifications"
    echo "  🏥 Receptionist: Patient registration + feedback + reminders"
    echo "  👥 Staff: Patient registration + feedback + reminders"
    echo "  🏥 Patient: Chatbot + feedback (mobile app recommended)"
    echo ""
else
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Manual deployment required.${NC}"
    echo "1. Upload the 'out' directory to Netlify"
    echo "2. Or use Netlify's drag-and-drop interface"
    echo ""
fi

echo -e "${BLUE}🧪 Testing the Dashboard:${NC}"
echo "1. Visit: https://healthtech-tracks-1-2.netlify.app"
echo "2. Click 'Staff Login'"
echo "3. Login with test credentials:"
echo "   - Admin: admin@hospital.com / admin123"
echo "   - Nurse: nurse@hospital.com / nurse123"
echo "   - Doctor: doctor@hospital.com / doctor123"
echo "4. Verify you're redirected to /dashboard"
echo "5. Check that features match your role"
echo ""

echo -e "${GREEN}🎉 Frontend Dashboard Fix Complete!${NC}"
echo ""
echo -e "${BLUE}📋 What's Fixed:${NC}"
echo "  ✅ Single unified dashboard for all roles"
echo "  ✅ Role-based feature cards and permissions"
echo "  ✅ Proper login redirection to /dashboard"
echo "  ✅ Color-coded interface based on user role"
echo "  ✅ Consistent behavior across all login forms"
echo "  ✅ Landing page for non-authenticated users"
echo ""

# Return to original directory
cd ../..

exit 0
