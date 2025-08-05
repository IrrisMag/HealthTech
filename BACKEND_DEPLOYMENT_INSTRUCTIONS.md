# 🚀 HealthTech Backend Deployment Instructions

## 🎯 **Current Status**

Based on the deployment check, here's what needs to be fixed:

### ❌ **Issues Found:**
1. **Track 1**: Auth and Feedback endpoints not accessible (`/api/auth`, `/api/feedback`)
2. **Track 2**: Chat endpoint missing (only Track 3 endpoints available)
3. **Track 3**: Working correctly but sharing deployment with Track 2

### ✅ **What's Working:**
- Track 1 main service: `https://track1-production.up.railway.app`
- Track 3 blood bank: `https://healthtech-production-e602.up.railway.app`
- All frontends are online

## 🔧 **Solution: Deploy Each Track Separately**

### **Step 1: Install Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### **Step 2: Deploy All Backends**
```bash
# Deploy all three tracks separately
./deploy_backends_railway.sh
```

**OR deploy individually:**

```bash
# Deploy Track 1 (Patient Communication)
./deploy_track1_railway.sh

# Deploy Track 2 (AI Chatbot)
./deploy_track2_railway.sh

# Deploy Track 3 (Blood Bank)
./deploy_track3_railway.sh
```

### **Step 3: Configure Environment Variables**

After deployment, configure these environment variables in Railway dashboard:

#### **🏥 Track 1 Environment Variables:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-super-secure-jwt-secret
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=8000
```

#### **🤖 Track 2 Environment Variables:**
```bash
GOOGLE_API_KEY=your-google-gemini-api-key
JWT_SECRET=your-super-secure-jwt-secret
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=8000
```

#### **🩸 Track 3 Environment Variables:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-super-secure-jwt-secret
DHIS2_BASE_URL=https://dhis2.dgh.cm
DHIS2_USERNAME=admin
DHIS2_PASSWORD=district
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=8000
```

### **Step 4: Verify Deployments**
```bash
# Check all deployments
./check_deployment_status.sh
```

## 🎯 **Expected Results After Deployment**

### **Track 1 Endpoints:**
- Health: `https://track1-new-url/health`
- Auth: `https://track1-new-url/api/auth`
- Feedback: `https://track1-new-url/api/feedback`
- Reminders: `https://track1-new-url/api/reminder`
- Notifications: `https://track1-new-url/api/notification`
- Translation: `https://track1-new-url/api/translation`

### **Track 2 Endpoints:**
- Health: `https://track2-new-url/health`
- Chat: `https://track2-new-url/chat`
- Clear Memory: `https://track2-new-url/clear-memory`
- Upload Document: `https://track2-new-url/upload-document`

### **Track 3 Endpoints:**
- Health: `https://track3-new-url/health`
- Dashboard Metrics: `https://track3-new-url/dashboard/metrics`
- Inventory: `https://track3-new-url/inventory`
- Forecasting: `https://track3-new-url/forecast/O+?periods=7`
- Optimization: `https://track3-new-url/recommendations/active`

## 🧪 **Testing Commands**

### **Test Track 1:**
```bash
# Test auth service
curl https://track1-new-url/api/auth/health

# Test feedback service
curl https://track1-new-url/api/feedback/health
```

### **Test Track 2:**
```bash
# Test chatbot
curl -X POST https://track2-new-url/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'
```

### **Test Track 3:**
```bash
# Test blood bank metrics
curl https://track3-new-url/dashboard/metrics
```

## 🔄 **Update Frontend URLs**

After successful deployment, update these files with new URLs:

1. `feedback-reminder-system/feedback-ui-service/.env.example`
2. `feedback-reminder-system/mobile/.env.example`
3. `tracks/track3/dashboard/.env.example`

## 📊 **Deployment Architecture**

```
🏥 Track 1 Backend (Railway) ← Frontend (Netlify)
    ├── Auth Service
    ├── Feedback Service
    ├── Reminder Service
    ├── Notification Service
    └── Translation Service

🤖 Track 2 Backend (Railway) ← Frontend (Netlify)
    ├── Chatbot Service
    ├── RAG Processing
    └── Medical Knowledge

🩸 Track 3 Backend (Railway) ← Dashboard (Netlify)
    ├── Data Ingestion
    ├── Forecasting
    ├── Optimization
    └── Blood Bank Management
```

## ⚡ **Quick Deployment (If Railway CLI Available)**

```bash
# One command to deploy everything
./deploy_backends_railway.sh
```

This will:
1. Create separate Railway projects for each track
2. Deploy with proper Dockerfiles
3. Configure basic environment variables
4. Provide URLs for each service

## 🆘 **Troubleshooting**

### **If Railway CLI not available:**
1. Go to [Railway Dashboard](https://railway.app)
2. Create new projects manually
3. Connect GitHub repository
4. Use the Dockerfiles provided
5. Configure environment variables

### **If deployment fails:**
1. Check Railway logs: `railway logs`
2. Verify Dockerfile paths
3. Ensure all dependencies are included
4. Check environment variables

## 🎉 **Success Criteria**

✅ All three tracks deployed separately  
✅ All API endpoints accessible  
✅ Health checks passing  
✅ Frontend can connect to backends  
✅ Chat functionality working  
✅ Blood bank dashboard functional  

---

**Ready to deploy? Run: `./deploy_backends_railway.sh`** 🚀
