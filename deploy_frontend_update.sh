#!/bin/bash

echo "🚀 Deploying Frontend Update - Track 1 & Track 2"
echo "================================================"

cd feedback-reminder-system/feedback-ui-service

# Create environment file for Netlify
cat > .env.production << EOF
NEXT_PUBLIC_TRACK1_API_URL=https://track1-production.up.railway.app
NEXT_PUBLIC_TRACK2_API_URL=https://healthtech-production-4917.up.railway.app
NEXT_PUBLIC_AUTH_API_URL=https://track1-production.up.railway.app
NEXT_PUBLIC_FEEDBACK_API_URL=https://track1-production.up.railway.app
NEXT_PUBLIC_REMINDER_API_URL=https://track1-production.up.railway.app
NEXT_PUBLIC_NOTIFICATION_API_URL=https://track1-production.up.railway.app
EOF

echo "✅ Environment configuration created"

# Try to build with memory optimization
echo "🔧 Building with optimized settings..."

# Update package.json to use memory-optimized build
npm pkg set scripts.build="NODE_OPTIONS='--max-old-space-size=1024' next build"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --silent
fi

# Try building
echo "🏗️ Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if Netlify CLI is available
    if command -v netlify &> /dev/null; then
        echo "🌐 Deploying to Netlify..."
        netlify deploy --prod --dir=out
    else
        echo "📁 Build completed. Manual deployment required."
        echo "   Upload the 'out' directory to Netlify"
    fi
else
    echo "⚠️ Build failed. Creating manual deployment package..."
    
    # Create a simple deployment package
    mkdir -p manual_deploy
    
    # Copy essential files
    cp -r app manual_deploy/ 2>/dev/null || true
    cp -r components manual_deploy/ 2>/dev/null || true
    cp -r lib manual_deploy/ 2>/dev/null || true
    cp -r public manual_deploy/ 2>/dev/null || true
    cp package.json manual_deploy/ 2>/dev/null || true
    cp next.config.js manual_deploy/ 2>/dev/null || true
    cp .env.production manual_deploy/ 2>/dev/null || true
    
    # Create a simple index.html with API configuration
    cat > manual_deploy/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HealthTech Platform</title>
    <script>
        // Set API configuration
        window.NEXT_PUBLIC_TRACK1_API_URL = "https://track1-production.up.railway.app";
        window.NEXT_PUBLIC_TRACK2_API_URL = "https://healthtech-production-4917.up.railway.app";
        
        // Redirect to the main application
        setTimeout(() => {
            window.location.href = "https://healthteh.netlify.app";
        }, 1000);
    </script>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 10px;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 HealthTech Platform</h1>
        <p>Douala General Hospital - Digital Healthcare System</p>
        <div class="spinner"></div>
        <p>Loading your personalized healthcare dashboard...</p>
        <p><small>Connecting to Track 1 & Track 2 services...</small></p>
    </div>
</body>
</html>
EOF
    
    echo "📦 Manual deployment package created in 'manual_deploy' directory"
    echo "   Upload this directory to Netlify manually"
fi

echo ""
echo "🎉 Frontend Update Process Complete!"
echo "=================================="
echo "🔗 Frontend URL: https://healthteh.netlify.app"
echo "🏥 Track 1 API: https://track1-production.up.railway.app"
echo "🤖 Track 2 API: https://healthtech-production-4917.up.railway.app"
echo ""
echo "✅ Next Steps:"
echo "1. Test the chatbot functionality"
echo "2. Verify role-based access control"
echo "3. Check all API connections"
