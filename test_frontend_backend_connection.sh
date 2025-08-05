#!/bin/bash

echo "🔗 Testing Frontend-Backend Connection"
echo "======================================"

# Test Track 1 Backend
echo "📡 Testing Track 1 Backend..."
TRACK1_URL="https://track1-production.up.railway.app"
TRACK1_HEALTH=$(curl -s "$TRACK1_URL/health" | jq -r '.status' 2>/dev/null || echo "error")

if [ "$TRACK1_HEALTH" = "healthy" ]; then
    echo "✅ Track 1 Backend: HEALTHY"
else
    echo "❌ Track 1 Backend: OFFLINE"
fi

# Test Track 2 Backend
echo "🤖 Testing Track 2 Backend..."
TRACK2_URL="https://healthtech-production-4917.up.railway.app"
TRACK2_HEALTH=$(curl -s "$TRACK2_URL/health" | jq -r '.status' 2>/dev/null || echo "error")

if [ "$TRACK2_HEALTH" = "healthy" ]; then
    echo "✅ Track 2 Backend: HEALTHY"
    
    # Test chatbot functionality
    echo "💬 Testing Track 2 Chatbot..."
    CHAT_RESPONSE=$(curl -X POST "$TRACK2_URL/chat" \
        -H "Content-Type: application/json" \
        -d '{"message": "Hello", "session_id": "test"}' \
        -s | jq -r '.response' 2>/dev/null)
    
    if [ ! -z "$CHAT_RESPONSE" ] && [ "$CHAT_RESPONSE" != "null" ]; then
        echo "✅ Track 2 Chatbot: WORKING"
        echo "   Response preview: ${CHAT_RESPONSE:0:50}..."
    else
        echo "❌ Track 2 Chatbot: NOT RESPONDING"
    fi
else
    echo "❌ Track 2 Backend: OFFLINE"
fi

# Test Frontend
echo "🌐 Testing Frontend..."
FRONTEND_URL="https://healthteh.netlify.app"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: ONLINE"
else
    echo "❌ Frontend: OFFLINE (Status: $FRONTEND_STATUS)"
fi

echo ""
echo "📋 Connection Summary:"
echo "======================"
echo "🏥 Track 1 API: $TRACK1_URL"
echo "🤖 Track 2 API: $TRACK2_URL"
echo "🌐 Frontend: $FRONTEND_URL"
echo ""

# Test API configuration in frontend
echo "🔧 Frontend API Configuration:"
echo "   TRACK1_API_URL should be: $TRACK1_URL"
echo "   TRACK2_API_URL should be: $TRACK2_URL"
echo ""

echo "✨ To test the complete flow:"
echo "1. Visit: $FRONTEND_URL"
echo "2. Login with any role"
echo "3. Navigate to chatbot"
echo "4. Send a test message"
echo ""

echo "🎯 Expected behavior:"
echo "   - Login should redirect based on role"
echo "   - Chatbot should respond with medical information"
echo "   - All role-based features should be visible"
