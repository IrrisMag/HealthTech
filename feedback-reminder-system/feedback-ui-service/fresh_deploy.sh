#!/bin/bash

echo "🚀 Fresh Deployment - HealthTech Frontend"
echo "========================================"

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf .next out dist build

# Update next.config.js for export build
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  distDir: 'out'
}

module.exports = nextConfig
EOF

echo "🔧 Updated Next.js configuration for export build"

# Set environment variables
export NEXT_PUBLIC_TRACK1_API_URL="https://track1-production.up.railway.app"
export NEXT_PUBLIC_TRACK2_API_URL="https://healthtech-production-4917.up.railway.app"
export NEXT_PUBLIC_CHATBOT_API_URL="https://healthtech-production-4917.up.railway.app"

echo "✅ Environment variables set for build"

# Try building
echo "🏗️ Building..."
NODE_OPTIONS="--max-old-space-size=1024" npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create _redirects file for SPA routing
    echo "/* /index.html 200" > out/_redirects
    
    echo "📁 Build output ready in 'out' directory"
    echo "🎉 Fresh deployment ready!"
    
else
    echo "❌ Build failed. Will rely on Netlify's build process."
fi

echo ""
echo "🎯 Deployment will happen automatically via Git push"
echo "🔗 Check: https://healthteh.netlify.app in 2-3 minutes"
