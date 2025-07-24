# 🏥 HealthTech Platform - Douala General Hospital

A comprehensive microservices-based healthcare platform for the "Co-Creating AI Solutions for Douala General Hospital (DGH)" project. This platform provides digital solutions to improve patient care, streamline hospital operations, and enhance communication between patients and healthcare providers.

## 🎯 **Project Overview**

The HealthTech platform is designed as a modular system with three independent tracks, each addressing specific healthcare challenges at Douala General Hospital:

### **✅ Track 1: Patient Communication & Feedback System (DEPLOYED)**
**Status**: Fully operational and production-ready
**Purpose**: Enhance patient-hospital communication and collect valuable feedback

**Key Features**:
- 💬 **Patient Feedback Collection**: Multi-language feedback forms with sentiment analysis
- ⏰ **Appointment Reminders**: Automated SMS/Email reminders for appointments
- 🌍 **Multi-language Support**: French, English, and local language support
- 📊 **Real-time Analytics**: Sentiment analysis and feedback categorization
- 🔐 **Secure Authentication**: Role-based access control for hospital staff

**Technologies**: FastAPI, Next.js, MongoDB Atlas, Twilio, Docker, Traefik

### **🔄 Track 2: AI-Powered Patient Support (PLANNED)**
**Status**: In development planning phase
**Purpose**: Provide intelligent patient assistance and education

**Planned Features**:
- 🤖 **Medical Chatbot**: AI assistant for patient queries and education
- 📚 **Health Information**: Automated health tips and medical guidance
- 📈 **Interaction Analytics**: Patient engagement and satisfaction metrics
- 🔗 **Integration**: Seamless connection with Track 1 services

**Technologies**: OpenAI GPT, FastAPI, React, Advanced NLP

### **🔄 Track 3: Advanced Healthcare Analytics (PLANNED)**
**Status**: Future development phase
**Purpose**: Data-driven insights for hospital operations optimization

**Planned Features**:
- 🩸 **Blood Bank Monitoring**: Inventory tracking and demand forecasting
- 📊 **Predictive Analytics**: Patient flow and resource optimization
- 🏥 **Resource Management**: Staff scheduling and equipment utilization
- 📋 **Advanced Reporting**: Comprehensive hospital performance dashboards

**Technologies**: Machine Learning, Time Series Analysis, Advanced Analytics

---

## 🏗️ **Project-Wide Architecture**

### **Overall System Design**
```
HealthTech Platform
├── Track 1: Patient Communication (ACTIVE)
│   ├── Frontend (Next.js) → localhost:3000
│   ├── Backend Services (Docker) → localhost:8001
│   └── Database (MongoDB Atlas) → healthtech.khb7ck1.mongodb.net
│
├── Track 2: AI Support (PLANNED)
│   ├── Chatbot Services → localhost:8002
│   └── Analytics Dashboard → TBD
│
└── Track 3: Advanced Analytics (PLANNED)
    ├── Data Management → localhost:8003
    └── Predictive Models → TBD
```

### **Technology Stack (Project-Wide)**
| Component | Track 1 (Active) | Track 2 (Planned) | Track 3 (Planned) |
|-----------|------------------|-------------------|-------------------|
| **Backend** | FastAPI + Docker | FastAPI + AI/ML | FastAPI + Analytics |
| **Frontend** | Next.js | React Dashboard | Analytics UI |
| **Database** | MongoDB Atlas | MongoDB Atlas | MongoDB Atlas + ML Storage |
| **AI/ML** | Sentiment Analysis | OpenAI GPT | Predictive Models |
| **Infrastructure** | Docker + Traefik | Docker + Traefik | Docker + Traefik |
| **Authentication** | JWT + RBAC | Shared Auth | Shared Auth |

### **Current Track 1 Architecture (Detailed)**
```
Patient/Staff Browser
    ↓ HTTP Requests
Next.js Frontend (localhost:3000)
    ↓ API Calls with CORS
Traefik Reverse Proxy (localhost:8001)
    ↓ Routes by subdomain
Docker Network (healthtech_default)
    ├── 🔐 auth-service → healthtech_auth
    ├── 💬 feedback-service → healthtech_feedback
    ├── ⏰ reminder-service → healthtech_reminders
    ├── 📢 notification-service → healthtech_notifications
    └── 🌍 translation-service → healthtech_translations
    ↓ Secure TLS Connections
MongoDB Atlas Cluster (healthtech.khb7ck1.mongodb.net)
    ├── Service-specific databases
    └── Automated backups & scaling
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites (All Tracks)**
- **Docker & Docker Compose**: For containerized services
- **Node.js 18+**: For frontend development
- **Git**: For repository management
- **Internet Connection**: For MongoDB Atlas access

### **System Setup**
```bash
# 1. Clone the repository
git clone <repository-url>
cd HealthTech

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials, Twilio keys, etc.

# 3. Configure local DNS (required for all tracks)
echo "127.0.0.1 auth.localhost feedback.localhost reminder.localhost notification.localhost translation.localhost" | sudo tee -a /etc/hosts
```

## 🎯 **Track-Specific Quick Start**

### **✅ Track 1: Patient Communication (Ready to Deploy)**

#### **Option A: One-Command Deploy**
```bash
# Deploy everything with one script
./deploy_track1.sh
```

#### **Option B: Manual Step-by-Step**
```bash
# Step 1: Start Backend Services (Docker)
docker-compose -f docker-compose.track1.yml up -d

# Step 2: Start Frontend Application (Local)
cd feedback-reminder-system/feedback-ui-service
npm install
npm run dev

# Step 3: Verify Deployment
curl http://feedback.localhost:8001/health
```

#### **Track 1 Access Points**
| Component | URL | Purpose |
|-----------|-----|---------|
| **🌐 Main Application** | http://localhost:3000 | Patient feedback interface |
| **🔐 Auth API** | http://auth.localhost:8001 | Authentication service |
| **💬 Feedback API** | http://feedback.localhost:8001 | Feedback collection |
| **⏰ Reminder API** | http://reminder.localhost:8001 | Appointment reminders |
| **📢 Notification API** | http://notification.localhost:8001 | SMS/Email delivery |
| **🌍 Translation API** | http://translation.localhost:8001 | Multi-language support |
| **📊 Infrastructure** | http://localhost:8081 | Traefik dashboard |

### **🔄 Track 2: AI Support (Future)**
```bash
# Planned deployment commands
./deploy_track2.sh

# Will include:
# - AI Chatbot Service
# - Patient Education Module
# - Analytics Dashboard
```

### **🔄 Track 3: Advanced Analytics (Future)**
```bash
# Planned deployment commands
./deploy_track3.sh

# Will include:
# - Blood Bank Monitoring
# - Predictive Analytics
# - Resource Optimization
```

---

## 📋 **Project-Wide Services Overview**

### **Track 1 Services (Currently Active)**
| Service | Purpose | Database | API Endpoint | Status |
|---------|---------|----------|--------------|--------|
| **🔐 Auth Service** | User authentication & authorization | `healthtech_auth` | `auth.localhost:8001` | ✅ Active |
| **💬 Feedback Service** | Patient feedback & sentiment analysis | `healthtech_feedback` | `feedback.localhost:8001` | ✅ Active |
| **⏰ Reminder Service** | Appointment reminders & scheduling | `healthtech_reminders` | `reminder.localhost:8001` | ✅ Active |
| **📢 Notification Service** | SMS/Email delivery via Twilio | `healthtech_notifications` | `notification.localhost:8001` | ✅ Active |
| **🌍 Translation Service** | Multi-language content support | `healthtech_translations` | `translation.localhost:8001` | ✅ Active |
| **🌐 Frontend UI** | Next.js patient interface | N/A | `localhost:3000` | ✅ Active |

### **Track 2 Services (Planned)**
| Service | Purpose | Database | API Endpoint | Status |
|---------|---------|----------|--------------|--------|
| **🤖 Chatbot Service** | AI medical assistant | `healthtech_chatbot` | `chatbot.localhost:8002` | 🔄 Planned |
| **📊 Analytics Service** | Patient interaction analytics | `healthtech_analytics` | `analytics.localhost:8002` | 🔄 Planned |

### **Track 3 Services (Planned)**
| Service | Purpose | Database | API Endpoint | Status |
|---------|---------|----------|--------------|--------|
| **🏥 Data Service** | Patient data management | `healthtech_patients` | `data.localhost:8003` | 🔄 Planned |
| **🔮 Forecasting Service** | Predictive health analytics | `healthtech_forecasting` | `forecasting.localhost:8003` | 🔄 Planned |
| **⚡ Optimization Service** | Resource & workflow optimization | `healthtech_optimization` | `optimization.localhost:8003` | 🔄 Planned |

---

## 🔧 **Development Workflow (All Tracks)**

### **Track 1 Development (Current)**
```bash
# Backend Development (Docker)
# Make changes to backend code
docker-compose -f docker-compose.track1.yml up -d --build feedback

# View service logs
docker logs healthtech-feedback-1 -f

# Check service health
curl http://feedback.localhost:8001/health

# Frontend Development (Local with Hot Reload)
cd feedback-reminder-system/feedback-ui-service
npm run dev
# Changes automatically reload at http://localhost:3000
```

### **Future Tracks Development**
```bash
# Track 2 (AI Services)
docker-compose -f docker-compose.track2.yml up -d --build
curl http://chatbot.localhost:8002/health

# Track 3 (Analytics)
docker-compose -f docker-compose.track3.yml up -d --build
curl http://data.localhost:8003/health
```

---

## 🧪 **Testing & Validation (Project-Wide)**

### **Track 1 Testing (Active)**
```bash
# Test Authentication
curl -X POST http://auth.localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Test Feedback Submission
curl -X POST http://feedback.localhost:8001/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "TEST_001",
    "text_feedback": "Excellent service at the hospital!",
    "rating": 5,
    "feedback_type": "general",
    "language": "en",
    "department": "reception"
  }'

# Test All Service Health
curl http://auth.localhost:8001/health
curl http://feedback.localhost:8001/health
curl http://reminder.localhost:8001/health
curl http://notification.localhost:8001/health
curl http://translation.localhost:8001/health

# Test Frontend Integration
# Open http://localhost:3000 and submit feedback through UI
```

### **Automated Testing**
```bash
# Run Track 1 integration tests
cd tests/
python -m pytest track1/ -v

# Future: Track 2 & 3 tests
python -m pytest track2/ -v  # Planned
python -m pytest track3/ -v  # Planned
```

---

## 🗄️ **Database Architecture (Project-Wide)**

### **MongoDB Atlas Cluster**
**Cluster**: `healthtech.khb7ck1.mongodb.net`
**Connection**: TLS encrypted, geographically distributed

### **Database Organization by Track**
```
Track 1 Databases (Active):
├── healthtech_auth          ✅ User authentication & roles
├── healthtech_feedback      ✅ Patient feedback & sentiment analysis
├── healthtech_reminders     ✅ Appointment scheduling & reminders
├── healthtech_notifications ✅ SMS/Email delivery logs
└── healthtech_translations  ✅ Multi-language content

Track 2 Databases (Planned):
├── healthtech_chatbot       🔄 AI conversation logs & training
└── healthtech_analytics     🔄 Patient interaction analytics

Track 3 Databases (Planned):
├── healthtech_patients      🔄 Secure patient records
├── healthtech_forecasting   🔄 Predictive models & results
├── healthtech_optimization  🔄 Resource optimization data
└── healthtech_scheduling    🔄 Advanced scheduling algorithms
```

### **Data Security & Compliance**
- **Encryption**: TLS 1.2+ for all database connections
- **Access Control**: Service-specific database isolation
- **Backup Strategy**: Automated Atlas backups with point-in-time recovery
- **Compliance**: HIPAA-ready infrastructure (pending full certification)

---

## 🔒 **Security & Authentication (Project-Wide)**

### **Authentication System**
- **Method**: JWT-based authentication with role-based access control (RBAC)
- **Token Lifetime**: 8 hours (hospital shift duration)
- **Roles**: Admin, Staff, Patient (with different permission levels)
- **Default Credentials**: `admin@hospital.com` / `admin123` (⚠️ **Change in production!**)

### **Security Measures**
| Component | Security Feature | Implementation |
|-----------|------------------|----------------|
| **Database** | TLS Encryption | MongoDB Atlas with TLS 1.2+ |
| **API Communication** | CORS Protection | Configured for cross-origin requests |
| **Service Isolation** | Docker Networks | Isolated container communication |
| **Data Access** | Service-specific DBs | Each service has dedicated database |
| **Authentication** | JWT Tokens | Stateless authentication across services |

### **Production Security Checklist**
- [ ] Change default admin password
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Implement rate limiting
- [ ] Configure backup encryption

---

## 📚 **Documentation & Resources**

### **Project Documentation**
| Document | Purpose | Track Coverage |
|----------|---------|----------------|
| **`README.md`** | Main project overview | All tracks |
| **`TRACKS_DEPLOYMENT.md`** | Detailed deployment guide | All tracks |
| **`MONGODB_ARCHITECTURE.md`** | Database design & structure | All tracks |
| **`ATLAS_CONNECTION_STATUS.md`** | Current database status | Track 1 |

### **Track-Specific Documentation**
```
Track 1 (Active):
├── feedback-reminder-system/README.md
├── auth/SECURITY_FEATURES.md
├── notification/README.md
└── reminder/README.md

Track 2 (Planned):
├── chatbot/README.md
└── analytics/README.md

Track 3 (Planned):
├── data/README.md
├── forecast/README.md
└── optimization/README.md
```

### **API Documentation**
- **Track 1 APIs**: Available at `http://service.localhost:8001/docs` (FastAPI auto-docs)
- **Track 2 APIs**: Will be available at `http://service.localhost:8002/docs`
- **Track 3 APIs**: Will be available at `http://service.localhost:8003/docs`

---

## 🤝 **Contributing to the Project**

### **Development Guidelines**
1. **Track-Specific Development**: Focus on one track at a time
2. **Service Isolation**: Ensure changes don't break other services
3. **Database Migrations**: Use proper migration scripts for schema changes
4. **Testing**: Write tests for new features and bug fixes
5. **Documentation**: Update relevant README files

### **Contribution Workflow**
```bash
# 1. Fork and clone the repository
git clone <your-fork-url>
cd HealthTech

# 2. Create feature branch
git checkout -b feature/track1-new-feature

# 3. Make changes and test
# For Track 1:
docker-compose -f docker-compose.track1.yml up -d --build
npm run dev

# 4. Submit pull request
git push origin feature/track1-new-feature
```

### **Code Review Process**
- **Track 1**: Ready for review and deployment
- **Track 2**: In planning phase, design reviews welcome
- **Track 3**: Future development, architectural input needed

---

## 🆘 **Troubleshooting (All Tracks)**

### **Common Issues**
| Issue | Track | Solution |
|-------|-------|----------|
| **Services won't start** | All | `docker ps` → Check container status |
| **Frontend can't connect** | 1 | Verify backend APIs with `curl` |
| **Database connection fails** | All | Check `ATLAS_CONNECTION_STATUS.md` |
| **CORS errors** | 1 | Verify CORS config in service logs |
| **Port conflicts** | All | Check `netstat -tulpn \| grep :800X` |

### **Track-Specific Troubleshooting**
```bash
# Track 1 Issues
docker-compose -f docker-compose.track1.yml logs -f
curl http://feedback.localhost:8001/health

# Future Track 2 Issues
docker-compose -f docker-compose.track2.yml logs -f

# Future Track 3 Issues
docker-compose -f docker-compose.track3.yml logs -f
```

### **Getting Help**
- **Track 1**: Fully documented, check service logs and documentation
- **Track 2**: Contact development team for AI/ML integration questions
- **Track 3**: Contact team for analytics and forecasting requirements

---

## 🎯 **Project Status & Roadmap**

### **Current Status**
- **✅ Track 1**: Production-ready, deployed and operational
- **🔄 Track 2**: Planning phase, AI integration design
- **🔄 Track 3**: Future development, requirements gathering

### **Next Steps**
1. **Track 1**: Hospital deployment and user training
2. **Track 2**: AI chatbot development and integration
3. **Track 3**: Analytics platform design and development

---

*The HealthTech platform represents a comprehensive approach to digital healthcare transformation at Douala General Hospital, with modular tracks enabling phased implementation and continuous improvement.*
