# 🏥 HealthTech Platform - Douala General Hospital

**Complete Healthcare Technology Solution with Microservices Architecture**
**Deployed in Tracks for Production Efficiency**

---

## 🌐 **ONLINE DEPLOYED PLATFORM ACCESS**

### 🎯 **Live Production Platform**
| Service | URL | Status | Description |
|---------|-----|--------|-------------|
| 🏠 **Main Platform** | **[https://healthteh.netlify.app](https://healthteh.netlify.app)** | 🟢 LIVE | Complete healthcare platform |
| 📡 **Track 1 API** | **[https://track1-production.up.railway.app](https://track1-production.up.railway.app)** | 🟢 RUNNING | Patient Communication System |
| 🤖 **Track 2 API** | **[https://healthtech-production-e602.up.railway.app](https://healthtech-production-e602.up.railway.app)** | 🟢 RUNNING | AI Medical Assistant |

### 📚 **API Documentation (Live)**
- **Track 1 Docs**: [https://track1-production.up.railway.app/docs](https://track1-production.up.railway.app/docs)
- **Track 2 Docs**: [https://healthtech-production-e602.up.railway.app/docs](https://healthtech-production-e602.up.railway.app/docs)

### ⚡ **Health Monitoring (Live)**
- **Track 1 Health**: [https://track1-production.up.railway.app/health](https://track1-production.up.railway.app/health)
- **Track 2 Health**: [https://healthtech-production-e602.up.railway.app/health](https://healthtech-production-e602.up.railway.app/health)

### 🎯 **Direct Feature Access**
| Feature | Direct Link | Description |
|---------|-------------|-------------|
| 📝 **Submit Feedback** | **[https://healthteh.netlify.app/feedback](https://healthteh.netlify.app/feedback)** | Patient feedback with AI analysis |
| 📅 **Appointment Reminders** | **[https://healthteh.netlify.app/reminders](https://healthteh.netlify.app/reminders)** | Schedule SMS reminders |
| 🤖 **AI Health Assistant** | **[https://healthteh.netlify.app/chatbot](https://healthteh.netlify.app/chatbot)** | Medical AI chatbot |
| 📊 **Analytics Dashboard** | **[https://healthteh.netlify.app/analytics](https://healthteh.netlify.app/analytics)** | Real-time healthcare analytics |

---

## 🏗️ **SYSTEM ARCHITECTURE**

### 🔧 **Microservices Architecture**
The HealthTech platform is built using a **microservices architecture** with the following independent services:

**Core Microservices:**
- 🔐 **Authentication Service** (`auth/`) - User authentication & authorization
- 📝 **Feedback Service** (`feedback/`) - Patient feedback collection & management
- 📅 **Reminder Service** (`reminder/`) - Appointment & medication reminders
- 📱 **Notification Service** (`notification/`) - SMS/Email delivery via Twilio
- 🧠 **Analysis Service** (`analysis/`) - AI sentiment analysis & keyword extraction
- 🤖 **Chatbot Service** (`chatbot/`) - AI medical assistant with LangChain
- 🌍 **Translation Service** (`translation/`) - Multi-language support
- 📊 **Data Service** (`data/`) - Data aggregation & management
- 📈 **Forecast Service** (`forecast/`) - Predictive analytics
- ⚡ **Optimization Service** (`optimization/`) - Performance optimization
- 📋 **Event Service** (`event/`) - Event logging & audit trails

**Frontend Applications:**
- 🌐 **Web UI** (`feedback-reminder-system/feedback-ui-service/`) - Next.js frontend
- 📱 **Mobile App** (`feedback-reminder-system/mobile/`) - React Native app

### 🚀 **Track-Based Deployment Strategy**
For **production deployment efficiency**, microservices are grouped into **tracks**:

**Track 1: Patient Communication System**
- Combines: `auth` + `feedback` + `reminder` + `notification` + `analysis` + `translation`
- **Purpose**: Complete patient communication workflow
- **Deployment**: Single FastAPI application with all Track 1 microservices

**Track 2: AI Medical Assistant**
- Combines: `chatbot` + `data` + `translation` + supporting AI services
- **Purpose**: AI-powered medical consultation and knowledge base
- **Deployment**: Single FastAPI application with LangChain + RAG

---

## 🐳 **DOCKER SETUP FOR INDIVIDUAL MICROSERVICES**

### 📋 **Prerequisites**
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 18+ and **npm** 8+
- **Python** 3.9+ and **pip**
- **Git** for version control

### 🔧 **Individual Microservice Development**

**Run Single Microservice:**
```bash
# Example: Run Authentication Service
cd auth
docker build -t healthtech-auth .
docker run -p 8000:8000 --env-file ../.env healthtech-auth

# Example: Run Feedback Service
cd feedback
docker build -t healthtech-feedback .
docker run -p 8001:8000 --env-file ../.env healthtech-feedback

# Example: Run Chatbot Service
cd chatbot
docker build -t healthtech-chatbot .
docker run -p 8002:8000 --env-file ../.env healthtech-chatbot
```

**Run All Microservices (Development):**
```bash
# Start all microservices with Traefik
docker-compose up --build -d
```

### 🌐 **Service-to-Service Communication (Inside Docker Network)**
```bash
# Internal microservice communication (container-to-container)
# Services use container names as hostnames within the same Docker network

# Core Microservices Internal URLs:
AUTH_SERVICE_URL=http://auth:8000
FEEDBACK_SERVICE_URL=http://feedback:8000
REMINDER_SERVICE_URL=http://reminder:8000
NOTIFICATION_SERVICE_URL=http://notification:8000
ANALYSIS_SERVICE_URL=http://analysis:8000
CHATBOT_SERVICE_URL=http://chatbot:8000
TRANSLATION_SERVICE_URL=http://translation:8000
DATA_SERVICE_URL=http://data:8000
FORECAST_SERVICE_URL=http://forecast:8000
OPTIMIZATION_SERVICE_URL=http://optimization:8000
EVENT_SERVICE_URL=http://event:8000

# Database & Infrastructure:
MONGODB_URL=mongodb://mongo:27017
MONGO_EXPRESS_URL=http://mongo-express:8081

# Frontend Applications:
FRONTEND_URL=http://feedback-ui-service:3000
MOBILE_URL=http://mobile:19006

# Example: How services communicate internally
# Reminder service calls Notification service:
# POST http://notification:8000/notifications/send
#
# Feedback service calls Analysis service:
# POST http://analysis:8000/analyze/sentiment
#
# Chatbot service calls Translation service:
# POST http://translation:8000/translate
```

### 🌐 **Service URLs - Outside Docker Network (via Traefik)**
```bash
# External access through Traefik reverse proxy
Auth Service:         http://auth.localhost
Feedback Service:     http://feedback.localhost
Reminder Service:     http://reminder.localhost
Notification Service: http://notification.localhost
Analysis Service:     http://analysis.localhost
Chatbot Service:      http://chatbot.localhost
Translation Service:  http://translation.localhost
Data Service:         http://data.localhost
Forecast Service:     http://forecast.localhost
Optimization Service: http://optimization.localhost
Event Service:        http://event.localhost

# Frontend Applications
Web Frontend:         http://feedback-ui.localhost
Mobile App:           http://feedback-mobile.localhost

# Infrastructure
Traefik Dashboard:    http://localhost:8080
MongoDB Admin:        http://mongo.localhost

# API Documentation (via Traefik)
Auth API Docs:        http://auth.localhost/docs
Feedback API Docs:    http://feedback.localhost/docs
Reminder API Docs:    http://reminder.localhost/docs
Notification API Docs: http://notification.localhost/docs
Analysis API Docs:    http://analysis.localhost/docs
Chatbot API Docs:     http://chatbot.localhost/docs
Translation API Docs: http://translation.localhost/docs
Data API Docs:        http://data.localhost/docs
Forecast API Docs:    http://forecast.localhost/docs
Optimization API Docs: http://optimization.localhost/docs
Event API Docs:       http://event.localhost/docs
```

---

## 🚀 **TRACK-BASED DEPLOYMENT (PRODUCTION)**

### 🎯 **Track 1: Patient Communication System**

**Quick Deploy Track 1 (Microservices Combined):**
```bash
# Clone repository
git clone <repository-url>
cd HealthTech

# Configure environment
cp .env.example .env
# Edit .env with your Twilio credentials:
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# Deploy Track 1
chmod +x deploy_track1.sh
./deploy_track1.sh
```

**Manual Track 1 Setup:**
```bash
# Start Track 1 services
docker-compose -f docker-compose.track1.yml up --build -d

# Access Track 1
# Frontend: http://localhost:3000
# Track 1 API: http://localhost:8001
# API Docs: http://localhost:8001/docs
# MongoDB Admin: http://localhost:8081

# Track 1 URLs - Service-to-Service Communication (Inside Docker Network):
# track1-backend: http://track1-backend:8000
# mongo: mongodb://mongo:27017
# frontend: http://frontend:3000
#
# Example: Frontend calls Track 1 API internally:
# fetch('http://track1-backend:8000/api/feedback/submit')
#
# Example: Track 1 backend connects to MongoDB:
# mongodb://mongo:27017/healthtech_track1

# Track 1 URLs - Outside Docker Network (via Traefik):
# Frontend: http://healthtech.localhost
# Track 1 API: http://track1.localhost
# Track 1 API Docs: http://track1.localhost/docs
# MongoDB Admin: http://mongo.localhost
```

**Track 1 Microservices Included:**
- 🔐 **Authentication Service** - User management & JWT tokens
- 📝 **Feedback Service** - Patient feedback collection
- 📅 **Reminder Service** - Appointment & medication scheduling
- 📱 **Notification Service** - SMS delivery via Twilio
- 🧠 **Analysis Service** - AI sentiment analysis & keyword extraction
- 🌍 **Translation Service** - Multi-language support

**Track 1 Features:**
- ✅ **Patient Feedback Collection** with AI sentiment analysis
- ✅ **SMS Appointment Reminders** via Twilio
- ✅ **Medication Reminders** with custom scheduling
- ✅ **Lab Results Notifications** with pickup alerts
- ✅ **Real-time Analytics Dashboard**

### 🤖 **Track 2: AI Medical Assistant (Microservices Combined)**

**Quick Deploy Track 2 Only:**
```bash
# Configure environment for Track 2
# Edit .env with your OpenAI API key:
# OPENAI_API_KEY=your_openai_api_key

# Deploy Track 2
chmod +x deploy_track2.sh
./deploy_track2.sh
```

**Manual Track 2 Setup:**
```bash
# Start Track 2 services
docker-compose -f docker-compose.track2.yml up --build -d

# Access Track 2
# Frontend: http://localhost:3000
# Track 2 API: http://localhost:8002
# API Docs: http://localhost:8002/docs
# MongoDB Admin: http://localhost:8082

# Track 2 URLs - Service-to-Service Communication (Inside Docker Network):
# track2-backend: http://track2-backend:8000
# mongo: mongodb://mongo:27017
# frontend: http://frontend:3000
#
# Example: Frontend calls Track 2 AI API internally:
# fetch('http://track2-backend:8000/api/chat')
#
# Example: Track 2 backend connects to MongoDB:
# mongodb://mongo:27017/healthtech_track2

# Track 2 URLs - Outside Docker Network (via Traefik):
# Frontend: http://healthtech.localhost
# Track 2 API: http://track2.localhost
# Track 2 API Docs: http://track2.localhost/docs
# MongoDB Admin: http://mongo.localhost
```

**Track 2 Microservices Included:**
- 🤖 **Chatbot Service** - LLM-powered medical assistant
- 📊 **Data Service** - Medical document management & retrieval
- 🌍 **Translation Service** - Multi-language medical consultations
- 📈 **Forecast Service** - Health trend analysis
- ⚡ **Optimization Service** - AI model performance optimization

**Track 2 Features:**
- ✅ **LLM-Powered Chatbot** using LangChain and RAG
- ✅ **Medical Document Knowledge Base**
- ✅ **Multilingual Health Consultations**
- ✅ **Diagnostic & Therapeutic Explanations**
- ✅ **DGH-Specific Medical Context**

---

## 🌟 **COMPLETE SYSTEM-WIDE DOCKER SETUP**

### 🚀 **Quick Deploy Complete Platform**
```bash
# Clone and setup
git clone <repository-url>
cd HealthTech

# Configure environment
cp .env.example .env
# Edit .env with ALL credentials:
# - Twilio (Track 1)
# - OpenAI (Track 2)
# - MongoDB settings

# Quick deploy with interactive menu
chmod +x quick-deploy.sh
./quick-deploy.sh
# Choose option 3 for complete platform
```

### 🔧 **Manual Complete Platform Setup**
```bash
# Start complete platform with Traefik
docker-compose up --build -d

# Access complete platform
# Frontend: http://healthtech.localhost
# Track 1 API: http://track1.localhost
# Track 2 API: http://track2.localhost
# MongoDB Admin: http://mongo.localhost
# Traefik Dashboard: http://localhost:8080

# Complete Platform URLs - Service-to-Service Communication (Inside Docker Network):
# track1-backend: http://track1-backend:8000
# track2-backend: http://track2-backend:8000
# frontend: http://frontend:3000
# mongo: mongodb://mongo:27017
# mongo-express: http://mongo-express:8081
#
# Example: Inter-service communication patterns:
# Frontend -> Track 1: fetch('http://track1-backend:8000/api/feedback/submit')
# Frontend -> Track 2: fetch('http://track2-backend:8000/api/chat')
# Track 1 -> MongoDB: mongodb://mongo:27017/healthtech_track1
# Track 2 -> MongoDB: mongodb://mongo:27017/healthtech_track2
# Any service -> MongoDB Admin: http://mongo-express:8081

# Complete Platform URLs - Outside Docker Network (via Traefik):
# Frontend: http://healthtech.localhost
# Track 1 API: http://track1.localhost
# Track 2 API: http://track2.localhost
# MongoDB Admin: http://mongo.localhost
# Traefik Dashboard: http://localhost:8080
```

### 🌐 **Complete Platform Architecture**

**Development Mode (All Microservices):**
```yaml
# docker-compose.yml - All Microservices
services:
  traefik:          # Reverse proxy & load balancer
  auth:             # Authentication microservice
  feedback:         # Feedback microservice
  reminder:         # Reminder microservice
  notification:     # Notification microservice
  analysis:         # Analysis microservice
  chatbot:          # Chatbot microservice
  translation:      # Translation microservice
  data:             # Data microservice
  forecast:         # Forecast microservice
  optimization:     # Optimization microservice
  event:            # Event microservice
  frontend:         # Next.js web application
  mobile:           # React Native mobile app
  mongo:            # MongoDB database
  mongo-express:    # Database admin interface
```

**Production Mode (Track-Based):**
```yaml
# Track-based deployment combines microservices
services:
  traefik:          # Reverse proxy & load balancer
  track1-backend:   # Combined: auth+feedback+reminder+notification+analysis+translation
  track2-backend:   # Combined: chatbot+data+translation+forecast+optimization
  frontend:         # Next.js web application
  mongo:            # MongoDB database
  mongo-express:    # Database admin interface
```

### 📊 **Service Management Commands**
```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f track1-backend
docker-compose logs -f track2-backend
docker-compose logs -f frontend

# Restart specific service
docker-compose restart track1-backend

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

---

## 🌐 **TRAEFIK REVERSE PROXY & NETWORK CONFIGURATION**

### 🔀 **Traefik Setup**
Traefik acts as a reverse proxy and load balancer, providing clean URLs and SSL termination.

**Traefik Configuration:**
```yaml
# In docker-compose.yml
traefik:
  image: traefik:v3.0
  command:
    - "--api.dashboard=true"
    - "--api.insecure=true"
    - "--providers.docker=true"
    - "--providers.docker.exposedbydefault=false"
    - "--entrypoints.web.address=:80"
    - "--entrypoints.websecure.address=:443"
  ports:
    - "80:80"
    - "443:443"
    - "8080:8080"  # Dashboard
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
```

### 🌐 **Network Access Patterns**

**1. Inside Docker Network (Container-to-Container):**
```bash
# Services communicate using container names
http://auth:8000
http://feedback:8000
http://reminder:8000
# etc.
```

**2. Outside Docker Network (via Traefik):**
```bash
# Clean URLs through Traefik reverse proxy
http://auth.localhost
http://feedback.localhost
http://reminder.localhost
# etc.
```

**3. Direct Port Access (Development):**
```bash
# Direct container port mapping
http://localhost:8001  # Track 1
http://localhost:8002  # Track 2
http://localhost:3000  # Frontend
```

### 🔧 **Local DNS Configuration**
For Traefik `.localhost` domains to work, add to your `/etc/hosts`:
```bash
# Add these entries to /etc/hosts
127.0.0.1 auth.localhost
127.0.0.1 feedback.localhost
127.0.0.1 reminder.localhost
127.0.0.1 notification.localhost
127.0.0.1 analysis.localhost
127.0.0.1 chatbot.localhost
127.0.0.1 translation.localhost
127.0.0.1 data.localhost
127.0.0.1 forecast.localhost
127.0.0.1 optimization.localhost
127.0.0.1 event.localhost
127.0.0.1 healthtech.localhost
127.0.0.1 track1.localhost
127.0.0.1 track2.localhost
127.0.0.1 mongo.localhost
127.0.0.1 feedback-ui.localhost
127.0.0.1 feedback-mobile.localhost
```

**Automated Setup:**
```bash
# Quick setup script
echo "127.0.0.1 auth.localhost feedback.localhost reminder.localhost notification.localhost analysis.localhost chatbot.localhost translation.localhost data.localhost forecast.localhost optimization.localhost event.localhost healthtech.localhost track1.localhost track2.localhost mongo.localhost feedback-ui.localhost feedback-mobile.localhost" | sudo tee -a /etc/hosts
```

---

## 🌐 **DOCKER NETWORKING & SERVICE COMMUNICATION**

### 🔗 **Service-to-Service Communication Patterns**

**1. Microservice Internal Communication (Same Docker Network):**
```bash
# Services communicate using container names as hostnames
# Example: Reminder service sending SMS via Notification service

# From reminder service container:
curl http://notification:8000/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+237670684672", "message": "Appointment reminder"}'

# From feedback service to analysis service:
curl http://analysis:8000/analyze/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Great service, very satisfied!"}'

# From chatbot service to translation service:
curl http://translation:8000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target_language": "fr"}'
```

**2. Database Connections (Internal Network):**
```bash
# All services connect to MongoDB using internal hostname
MONGODB_URL=mongodb://mongo:27017/database_name

# Examples:
# Track 1: mongodb://mongo:27017/healthtech_track1
# Track 2: mongodb://mongo:27017/healthtech_track2
# Auth: mongodb://mongo:27017/healthtech_auth
# Feedback: mongodb://mongo:27017/healthtech_feedback
```

**3. Frontend to Backend Communication:**
```javascript
// Frontend (Next.js) calling backend services internally
// When running in Docker, frontend uses internal URLs

// Development (outside Docker):
const track1ApiUrl = 'http://localhost:8001';
const track2ApiUrl = 'http://localhost:8002';

// Production Docker (internal network):
const track1ApiUrl = 'http://track1-backend:8000';
const track2ApiUrl = 'http://track2-backend:8000';

// Example API calls:
fetch(`${track1ApiUrl}/api/feedback/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(feedbackData)
});

fetch(`${track2ApiUrl}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What are malaria symptoms?' })
});
```

### 🌐 **Network Access Summary**

| Access Type | URL Pattern | Use Case | Example |
|-------------|-------------|----------|---------|
| **Internal Service-to-Service** | `http://service-name:8000` | Microservice communication | `http://notification:8000/send` |
| **External via Traefik** | `http://service.localhost` | Browser/API testing | `http://feedback.localhost/docs` |
| **Direct Port Mapping** | `http://localhost:PORT` | Development/debugging | `http://localhost:8001/health` |
| **Database Internal** | `mongodb://mongo:27017` | Service-to-DB connection | `mongodb://mongo:27017/healthtech` |

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### 📝 **Required Environment Variables**

Create `.env` file from template:
```bash
cp .env.example .env
```

**Track 1 Requirements:**
```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Track 2 Requirements:**
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

**Database Configuration:**
```bash
# Local Development
MONGODB_URL=mongodb://admin:password123@mongo:27017/healthtech?authSource=admin

# Production (MongoDB Atlas)
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/healthtech
```

**Security Settings:**
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENVIRONMENT=development
```

---

## 🧪 **TESTING & VERIFICATION**

### 🔍 **Health Checks**
```bash
# Test Track 1 (Local)
curl http://localhost:8001/health

# Test Track 2 (Local)
curl http://localhost:8002/health

# Test Frontend (Local)
curl http://localhost:3000

# Test Complete Platform (Traefik - Outside Docker Network)
curl http://track1.localhost/health
curl http://track2.localhost/health
curl http://healthtech.localhost

# Test Services (Inside Docker Network)
docker exec <container_name> curl http://track1-backend:8000/health
docker exec <container_name> curl http://track2-backend:8000/health
docker exec <container_name> curl http://frontend:3000
```

### 📱 **SMS Testing (Track 1)**
```bash
# Create appointment reminder
curl -X POST http://localhost:8001/api/reminders/create \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "test_patient",
    "phone": "+237670684672",
    "appointment_date": "2025-07-30",
    "appointment_time": "14:30",
    "doctor_name": "Dr. Test",
    "department": "General"
  }'
```

### 🤖 **AI Testing (Track 2)**
```bash
# Chat with AI assistant
curl -X POST http://localhost:8002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the symptoms of malaria?",
    "session_id": "test_session"
  }'
```

---

## 📁 **PROJECT STRUCTURE**

```
HealthTech/
├── 📄 README.md                    # This comprehensive guide
├── 🐳 docker-compose.yml           # All microservices orchestration
├── 🐳 docker-compose.track1.yml    # Track 1 deployment (microservices combined)
├── 🐳 docker-compose.track2.yml    # Track 2 deployment (microservices combined)
├── 🔧 .env.example                 # Environment configuration template
├── 🚀 deploy_track1.sh             # Track 1 deployment script
├── 🚀 deploy_track2.sh             # Track 2 deployment script
├── 🚀 quick-deploy.sh              # Interactive deployment menu
│
├── 📁 **MICROSERVICES** (Individual Services)
│   ├── 📁 auth/                    # 🔐 Authentication microservice
│   ├── 📁 feedback/                # 📝 Feedback microservice
│   ├── 📁 reminder/                # 📅 Reminder microservice
│   ├── 📁 notification/            # 📱 Notification microservice
│   ├── 📁 analysis/                # 🧠 Analysis microservice
│   ├── 📁 chatbot/                 # 🤖 Chatbot microservice
│   ├── 📁 translation/             # 🌍 Translation microservice
│   ├── 📁 data/                    # 📊 Data microservice
│   ├── 📁 forecast/                # 📈 Forecast microservice
│   ├── 📁 optimization/            # ⚡ Optimization microservice
│   └── 📁 event/                   # 📋 Event microservice
│
├── 📁 **TRACK DEPLOYMENTS** (Combined for Production)
│   └── 📁 feedback-reminder-system/
│       ├── 📁 track1-backend/      # Track 1: Combined microservices
│       ├── 📁 track2-backend/      # Track 2: Combined microservices
│       ├── 📁 feedback-ui-service/ # Frontend (Next.js)
│       └── 📁 mobile/              # Mobile app (React Native)
│
└── 📁 scripts/                     # Database initialization & utilities
```

### 🎯 **Architecture Summary**
- **Development**: Run individual microservices for granular development
- **Production**: Deploy combined tracks for efficiency and performance
- **Microservices**: Each service is independently developed and tested
- **Tracks**: Logical grouping of microservices for deployment optimization

---

## 🎉 **DEPLOYMENT SUCCESS SUMMARY**

### ✅ **Production Platform Status**
- **🌐 Frontend**: [https://healthteh.netlify.app](https://healthteh.netlify.app) - **LIVE**
- **📡 Track 1**: [https://track1-production.up.railway.app](https://track1-production.up.railway.app) - **RUNNING**
- **🤖 Track 2**: [https://healthtech-production-e602.up.railway.app](https://healthtech-production-e602.up.railway.app) - **RUNNING**

### ✅ **All Features Operational**
- **📝 Patient Feedback** with AI sentiment analysis
- **📅 SMS Reminders** via Twilio (+237670684672 verified)
- **🤖 AI Medical Assistant** with LangChain + RAG
- **📊 Real-time Analytics** dashboard
- **🌍 Multi-language Support** (5 languages)

---

**🌍 Proudly serving healthcare technology needs across Cameroon and beyond! 🚀**

**Built with ❤️ for Douala General Hospital and the healthcare community of Cameroon.**
