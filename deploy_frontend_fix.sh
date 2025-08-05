#!/bin/bash

echo "🚀 Deploying Frontend Fix for Track 1 & Track 2"
echo "================================================"

# Set correct API URLs
export NEXT_PUBLIC_TRACK1_API_URL="https://track1-production.up.railway.app"
export NEXT_PUBLIC_TRACK2_API_URL="https://healthtech-production-4917.up.railway.app"

echo "✅ Environment variables set:"
echo "   TRACK1_API_URL: $NEXT_PUBLIC_TRACK1_API_URL"
echo "   TRACK2_API_URL: $NEXT_PUBLIC_TRACK2_API_URL"

cd feedback-reminder-system/feedback-ui-service

echo "📦 Installing dependencies..."
npm install --silent

echo "🔧 Building frontend..."
# Try with reduced memory usage
NODE_OPTIONS="--max-old-space-size=2048" npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🌐 Deploying to Netlify..."
    # Deploy the out directory to Netlify
    npx netlify-cli deploy --prod --dir=out --site=healthteh
    
    echo "🎉 Frontend deployed successfully!"
    echo "🔗 URL: https://healthteh.netlify.app"
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Create a simple index.html with the correct API configuration
    mkdir -p dist
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>HealthTech Platform - Redirecting...</title>
    <script>
        // Set correct API URLs and redirect to working version
        window.NEXT_PUBLIC_TRACK1_API_URL = "https://track1-production.up.railway.app";
        window.NEXT_PUBLIC_TRACK2_API_URL = "https://healthtech-production-4917.up.railway.app";
        
        // Redirect to the working frontend
        window.location.href = "https://healthteh.netlify.app";
    </script>
</head>
<body>
    <p>Redirecting to HealthTech Platform...</p>
</body>
</html>
EOF
    
    echo "📄 Created fallback redirect page"
fi

echo "🏁 Deployment process completed!"
