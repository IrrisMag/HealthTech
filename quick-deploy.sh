#!/bin/bash

# Quick Deploy Script for HealthTech Platform
# This script provides options to deploy individual tracks or the complete system

echo "🏥 HealthTech Platform - Quick Deploy"
echo "====================================="
echo ""
echo "Choose deployment option:"
echo "1) 📱 Track 1 Only (Patient Communication System)"
echo "2) 🤖 Track 2 Only (AI Medical Assistant)"
echo "3) 🌟 Complete Platform (Both Tracks + Traefik)"
echo "4) 🛑 Stop All Services"
echo "5) 📊 Show Service Status"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying Track 1 (Patient Communication System)..."
        chmod +x deploy_track1.sh
        ./deploy_track1.sh
        ;;
    2)
        echo "🚀 Deploying Track 2 (AI Medical Assistant)..."
        chmod +x deploy_track2.sh
        ./deploy_track2.sh
        ;;
    3)
        echo "🚀 Deploying Complete Platform..."
        
        # Check if .env file exists
        if [ ! -f .env ]; then
            echo "❌ Error: .env file not found!"
            echo "📝 Please copy .env.example to .env and configure your settings:"
            echo "   cp .env.example .env"
            exit 1
        fi
        
        # Stop any existing services
        echo "🛑 Stopping existing services..."
        docker-compose down
        docker-compose -f docker-compose.track1.yml down
        docker-compose -f docker-compose.track2.yml down
        
        # Start complete platform
        echo "🚀 Starting complete platform with Traefik..."
        docker-compose up --build -d
        
        # Wait for services
        echo "⏳ Waiting for services to start..."
        sleep 20
        
        echo "🎉 Complete Platform Deployed!"
        echo ""
        echo "📋 Access Information:"
        echo "   🌐 Frontend:           http://healthtech.localhost"
        echo "   📡 Track 1 API:        http://track1.localhost"
        echo "   🤖 Track 2 API:        http://track2.localhost"
        echo "   🗄️ MongoDB Admin:      http://mongo.localhost"
        echo "   🔀 Traefik Dashboard:  http://localhost:8080"
        echo ""
        echo "📚 API Documentation:"
        echo "   📡 Track 1 Docs:       http://track1.localhost/docs"
        echo "   🤖 Track 2 Docs:       http://track2.localhost/docs"
        ;;
    4)
        echo "🛑 Stopping all services..."
        docker-compose down
        docker-compose -f docker-compose.track1.yml down
        docker-compose -f docker-compose.track2.yml down
        echo "✅ All services stopped"
        ;;
    5)
        echo "📊 Service Status:"
        echo ""
        echo "🐳 Docker Containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "🌐 Service Health Checks:"
        
        # Check Track 1
        if curl -s http://localhost:8001/health > /dev/null 2>&1; then
            echo "✅ Track 1 Backend: Running (http://localhost:8001)"
        elif curl -s http://track1.localhost/health > /dev/null 2>&1; then
            echo "✅ Track 1 Backend: Running (http://track1.localhost)"
        else
            echo "❌ Track 1 Backend: Not responding"
        fi
        
        # Check Track 2
        if curl -s http://localhost:8002/health > /dev/null 2>&1; then
            echo "✅ Track 2 Backend: Running (http://localhost:8002)"
        elif curl -s http://track2.localhost/health > /dev/null 2>&1; then
            echo "✅ Track 2 Backend: Running (http://track2.localhost)"
        else
            echo "❌ Track 2 Backend: Not responding"
        fi
        
        # Check Frontend
        if curl -s -o /dev/null http://localhost:3000 2>&1; then
            echo "✅ Frontend: Running (http://localhost:3000)"
        elif curl -s -o /dev/null http://healthtech.localhost 2>&1; then
            echo "✅ Frontend: Running (http://healthtech.localhost)"
        else
            echo "❌ Frontend: Not responding"
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1-5."
        exit 1
        ;;
esac

echo ""
echo "📝 For more information, see README.md"
