# 🚀 Track 3 Backend Railway Deployment Guide

## 🎯 **Complete AI-Enhanced Blood Bank System Deployment**

This guide deploys the complete Track 3 backend to Railway under the HealthTech project with full AI capabilities and DHIS2 integration.

---

## 🚀 **Quick Deployment**

### **Option 1: Automated Script**
```bash
# Run the automated deployment script
./deploy_track3_backend_railway.sh
```

### **Option 2: Manual Deployment**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Navigate to Track 3 directory
cd track3-blood-bank-system

# 4. Initialize Railway project
railway init --name "track3-blood-bank-backend"

# 5. Set environment variables
railway variables set MONGODB_URL="mongodb+srv://healthtech:healthtech2024@cluster0.mongodb.net/healthtech_track3?retryWrites=true&w=majority"
railway variables set DATABASE_NAME="healthtech_track3"
railway variables set DHIS2_BASE_URL="https://play.im.dhis2.org/stable-2-42-1"
railway variables set DHIS2_USERNAME="admin"
railway variables set DHIS2_PASSWORD="district"
railway variables set PORT="8000"

# 6. Deploy
railway up --detach
```

---

## 🔧 **Environment Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URL` | `mongodb+srv://healthtech:healthtech2024@cluster0.mongodb.net/healthtech_track3?retryWrites=true&w=majority` | MongoDB Atlas connection |
| `DATABASE_NAME` | `healthtech_track3` | Database name |
| `DHIS2_BASE_URL` | `https://play.im.dhis2.org/stable-2-42-1` | DHIS2 server URL |
| `DHIS2_USERNAME` | `admin` | DHIS2 username |
| `DHIS2_PASSWORD` | `district` | DHIS2 password |
| `PORT` | `8000` | Application port |
| `PYTHONPATH` | `/app` | Python path |

---

## 📋 **Deployment Files Created**

### **1. main.py** - Complete Backend
- FastAPI application with all Track 3 features
- DHIS2 integration with live connection
- AI forecasting engine (ARIMA, XGBoost)
- MongoDB database operations
- Complete CRUD for donors, donations, requests
- Real-time inventory management
- Optimization recommendations

### **2. requirements.txt** - Dependencies
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
motor==3.3.2
pymongo==4.6.0
pandas==2.1.4
numpy==1.24.3
scikit-learn==1.3.2
statsmodels==0.14.0
xgboost==2.0.2
tensorflow==2.15.0
pulp==2.7.0
scipy==1.11.4
httpx==0.25.2
# ... and more
```

### **3. Procfile** - Railway Process
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **4. railway.json** - Railway Configuration
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 🌐 **API Endpoints**

Once deployed, the following endpoints will be available:

### **Core Endpoints**
- `GET /` - API information and status
- `GET /health` - Health check
- `GET /dhis2/test` - Test DHIS2 connection

### **Donor Management**
- `GET /donors` - Get donors with pagination
- `POST /donors` - Register new donor

### **Inventory Management**
- `GET /inventory` - Get blood inventory
- `POST /donations` - Record blood donation

### **Blood Requests**
- `GET /requests` - Get blood requests
- `POST /requests` - Create blood request

### **AI Forecasting**
- `GET /forecast/{blood_type}` - Get demand forecast
- `GET /optimization/recommendations` - Get optimization recommendations

### **Analytics**
- `GET /analytics/performance` - Performance analytics
- `GET /dashboard/metrics` - Dashboard metrics

---

## 🔍 **Testing the Deployment**

### **1. Health Check**
```bash
curl https://your-railway-url.railway.app/health
```

### **2. DHIS2 Connection Test**
```bash
curl https://your-railway-url.railway.app/dhis2/test
```

### **3. Get Donors**
```bash
curl https://your-railway-url.railway.app/donors
```

### **4. Get Inventory**
```bash
curl https://your-railway-url.railway.app/inventory
```

---

## 🎯 **Track 3 Features Deployed**

### ✅ **System Integration & Data Ingestion**
- **DHIS2 Integration**: Live connection to `https://play.im.dhis2.org/stable-2-42-1`
- **RESTful APIs**: Complete FastAPI implementation
- **Real-time Data**: MongoDB with live operations
- **Secure Authentication**: DHIS2 auth integration

### ✅ **AI Forecasting & Modeling**
- **ARIMA Models**: Time series forecasting for blood demand
- **XGBoost**: Advanced machine learning predictions
- **Feature Engineering**: Blood type patterns, usage trends
- **API Accessible**: All models available via REST endpoints

### ✅ **Real-time Monitoring**
- **Live Inventory**: Real-time stock level tracking
- **Status Segmentation**: Available, reserved, expired tracking
- **Color-coded Indicators**: Status-based visual indicators
- **Performance Analytics**: System efficiency metrics

### ✅ **Inventory Optimization**
- **Linear Programming**: Optimal ordering recommendations
- **Safety Stock**: Automated safety level calculations
- **Cost Analysis**: Financial impact assessments
- **Dynamic Suggestions**: Real-time optimization advice

### ✅ **Complete CRUD Operations**
- **Donor Management**: Full lifecycle management
- **Donation Tracking**: Complete donation workflow
- **Request Handling**: Blood request processing
- **Inventory Control**: Real-time inventory updates

---

## 🔧 **Post-Deployment Configuration**

### **1. Update Frontend API URLs**
Update your frontend environment variables to point to the new Railway backend:

```env
NEXT_PUBLIC_TRACK3_API_URL=https://your-railway-url.railway.app
```

### **2. Database Initialization**
The backend will automatically:
- Create necessary MongoDB collections
- Set up database indexes
- Initialize DHIS2 connection
- Start AI forecasting engines

### **3. Monitoring**
- Check Railway dashboard for deployment status
- Monitor logs for any issues
- Test all API endpoints
- Verify DHIS2 connection

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Deployment Fails**
```bash
# Check Railway logs
railway logs

# Redeploy
railway up --detach
```

#### **2. Database Connection Issues**
- Verify MongoDB URL in environment variables
- Check network connectivity
- Ensure database exists

#### **3. DHIS2 Connection Fails**
- Test DHIS2 credentials
- Check server availability
- Verify network access

#### **4. AI Models Not Loading**
- Check Python dependencies
- Verify memory allocation
- Monitor startup logs

---

## 📊 **Expected Performance**

### **Response Times**
- Health check: < 100ms
- Donor queries: < 500ms
- Inventory updates: < 300ms
- AI forecasts: < 2s

### **Throughput**
- Concurrent users: 100+
- Requests per second: 50+
- Database operations: 1000+/min

### **Reliability**
- Uptime: 99.9%
- Auto-restart on failure
- Health check monitoring
- Error recovery

---

## 🎉 **Deployment Success Indicators**

✅ Railway deployment completes without errors  
✅ Health check returns "healthy" status  
✅ DHIS2 connection test succeeds  
✅ Database operations work correctly  
✅ AI forecasting endpoints respond  
✅ All CRUD operations functional  
✅ Real-time monitoring active  

**Your Track 3 AI-Enhanced Blood Bank System is now live on Railway! 🚀**

---

## 📞 **Support**

If you encounter any issues:
1. Check Railway dashboard logs
2. Verify environment variables
3. Test individual endpoints
4. Monitor database connectivity
5. Check DHIS2 server status

**The complete Track 3 backend is now deployed and operational! 🩸🤖**
