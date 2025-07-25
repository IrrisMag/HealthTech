# 🤖 Track 2: AI-Powered Patient Support - Docker Deployment Guide

## 🎯 **Overview**

This guide provides step-by-step instructions for deploying Track 2 (AI-Powered Patient Support) using Docker Compose and Traefik, similar to Track 1's deployment architecture.

## 🏗️ **Architecture**

```
Track 2: AI-Powered Patient Support
├── Traefik Reverse Proxy (localhost:8082)
│   ├── CORS middleware for frontend integration
│   ├── Load balancing and health checks
│   └── API routing to chatbot service
│
├── Chatbot Service (chatbot.localhost:8002)
│   ├── Google Gemini AI integration
│   ├── RAG document processing
│   ├── Conversation memory management
│   └── Health monitoring endpoints
│
└── Volumes & Networks
    ├── Document storage (PDF processing)
    ├── Conversation memory persistence
    └── Isolated network (healthtech_track2)
```

## 🚀 **Quick Deployment**

### **Prerequisites**
- Docker and Docker Compose installed
- Port 8002 and 8082 available
- Google Gemini API key (optional, has fallback)

### **One-Command Deployment**
```bash
# Clone and deploy
git clone <repository-url>
cd HealthTech
./deploy_track2.sh
```

## 🔧 **Manual Deployment**

### **Step 1: Environment Configuration**
```bash
# Copy environment template
cp .env.track2.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Google Gemini API Key (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS origins for frontend integration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Application settings
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### **Step 2: Add Medical Documents (Optional)**
```bash
# Create docs directory if it doesn't exist
mkdir -p chatbot/patient_support/docs

# Add PDF medical documents for RAG functionality
cp your-medical-documents.pdf chatbot/patient_support/docs/
```

### **Step 3: Deploy Services**
```bash
# Build and start services
docker-compose -f docker-compose.track2.yml up --build -d

# Check service status
docker-compose -f docker-compose.track2.yml ps
```

### **Step 4: Verify Deployment**
```bash
# Health checks
curl http://chatbot.localhost:8002/health
curl http://localhost:8082/api/rawdata

# Test chatbot API
curl -X POST http://chatbot.localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the symptoms of malaria?", "session_id": "test"}'
```

## 🌐 **Access Points**

| Service | URL | Purpose |
|---------|-----|---------|
| **🤖 Chatbot API** | http://chatbot.localhost:8002 | Main AI service |
| **📚 API Documentation** | http://chatbot.localhost:8002/docs | Interactive API docs |
| **🏥 Health Check** | http://chatbot.localhost:8002/health | Service monitoring |
| **📊 Traefik Dashboard** | http://localhost:8082 | Infrastructure monitoring |
| **🔍 Document Status** | http://chatbot.localhost:8002/documents | RAG document info |

## 🔗 **Frontend Integration**

### **Web Interface**
The chatbot is automatically integrated with the Track 1 frontend:
```bash
# Start Track 1 frontend (if not already running)
cd feedback-reminder-system/feedback-ui-service
npm run dev

# Access integrated chatbot
open http://localhost:3000/chatbot
```

### **Mobile Interface**
```bash
# Start mobile app (if not already running)
cd feedback-reminder-system/mobile
expo start

# Navigate to chatbot screen in the app
```

## 🧪 **Testing & Validation**

### **API Testing**
```bash
# Basic health check
curl http://chatbot.localhost:8002/health

# Chat functionality
curl -X POST http://chatbot.localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a fever and headache. What should I do?",
    "session_id": "test_session"
  }'

# Document management
curl http://chatbot.localhost:8002/documents
curl -X POST http://chatbot.localhost:8002/reload-documents

# Memory management
curl -X DELETE http://chatbot.localhost:8002/clear-memory
```

### **Frontend Integration Testing**
1. Open http://localhost:3000/chatbot
2. Send a health-related message
3. Verify AI response with source attribution
4. Test conversation memory with follow-up questions

## 📊 **Monitoring & Logs**

### **Service Logs**
```bash
# View chatbot logs
docker-compose -f docker-compose.track2.yml logs -f chatbot

# View Traefik logs
docker-compose -f docker-compose.track2.yml logs -f traefik

# View all services
docker-compose -f docker-compose.track2.yml logs -f
```

### **Health Monitoring**
```bash
# Service health status
curl http://chatbot.localhost:8002/health

# Traefik service discovery
curl http://localhost:8082/api/rawdata

# Document processing status
curl http://chatbot.localhost:8002/documents
```

## 🔒 **Security Features**

- **Environment-based API key management**
- **CORS protection for cross-origin requests**
- **Network isolation from other tracks**
- **Read-only document volumes**
- **Health check endpoints for monitoring**

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check port conflicts
netstat -tulpn | grep -E ":800[2,82]"

# Check Docker logs
docker-compose -f docker-compose.track2.yml logs chatbot

# Rebuild containers
docker-compose -f docker-compose.track2.yml up --build --force-recreate
```

#### **Frontend Can't Connect**
```bash
# Verify CORS configuration
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://chatbot.localhost:8002/chat

# Check Traefik routing
curl http://localhost:8082/api/rawdata | grep chatbot
```

#### **API Key Issues**
```bash
# Check environment variables
docker-compose -f docker-compose.track2.yml exec chatbot env | grep GEMINI

# Test with default key (has rate limits)
# The system includes a fallback API key for testing
```

## 🛑 **Stopping Services**

```bash
# Stop all Track 2 services
docker-compose -f docker-compose.track2.yml down

# Stop and remove volumes
docker-compose -f docker-compose.track2.yml down -v

# Remove images
docker-compose -f docker-compose.track2.yml down --rmi all
```

## 🎊 **Success Indicators**

### **✅ Deployment Successful When:**
- [ ] Chatbot service responds to health checks
- [ ] Traefik dashboard shows healthy services
- [ ] API documentation accessible
- [ ] Chat API returns AI responses
- [ ] Frontend integration working
- [ ] Document processing functional

### **✅ Production Ready When:**
- [ ] Custom Gemini API key configured
- [ ] Medical documents loaded for RAG
- [ ] CORS properly configured for production URLs
- [ ] Health monitoring in place
- [ ] Logs properly configured

---

*Track 2 is now deployed with the same robust architecture as Track 1! 🎉*
