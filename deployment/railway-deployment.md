# 🚀 Railway Deployment Guide for Track 1 & Track 2

## 🌟 Why Railway?
- **$5 free credit** (enough for demo period)
- **Docker support** (perfect for our containers)
- **Automatic HTTPS** and custom domains
- **Environment variables** management
- **Database hosting** (MongoDB)
- **Easy GitHub integration**

## 📋 Prerequisites
1. GitHub account with your HealthTech repository
2. Railway account (sign up at railway.app)
3. MongoDB Atlas account (free tier)

## 🎯 Track 1 Deployment (Patient Communication System)

### Step 1: Prepare Repository
```bash
# Create a railway branch for deployment
git checkout -b railway-deployment

# Create railway.json for Track 1
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF
```

### Step 2: Create Railway Dockerfile for Track 1
```dockerfile
# Dockerfile.railway
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY feedback-reminder-system/feedback-ui-service/package*.json ./
RUN npm ci
COPY feedback-reminder-system/feedback-ui-service/ ./
RUN npm run build

FROM python:3.11-slim AS backend-base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY auth/requirements.txt ./auth/
COPY feedback/requirements.txt ./feedback/
COPY reminder/requirements.txt ./reminder/
COPY notification/requirements.txt ./notification/
COPY translation/requirements.txt ./translation/

RUN pip install -r auth/requirements.txt
RUN pip install -r feedback/requirements.txt
RUN pip install -r reminder/requirements.txt
RUN pip install -r notification/requirements.txt
RUN pip install -r translation/requirements.txt

# Copy application code
COPY auth/ ./auth/
COPY feedback/ ./feedback/
COPY reminder/ ./reminder/
COPY notification/ ./notification/
COPY translation/ ./translation/
COPY shared/ ./shared/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./static/

# Create startup script
RUN echo '#!/bin/bash\n\
python -m uvicorn auth.main:app --host 0.0.0.0 --port $PORT &\n\
python -m uvicorn feedback.main:app --host 0.0.0.0 --port $(($PORT + 1)) &\n\
python -m uvicorn reminder.main:app --host 0.0.0.0 --port $(($PORT + 2)) &\n\
python -m uvicorn notification.main:app --host 0.0.0.0 --port $(($PORT + 3)) &\n\
python -m uvicorn translation.main:app --host 0.0.0.0 --port $(($PORT + 4)) &\n\
python -m http.server $PORT --directory static\n\
wait' > start.sh && chmod +x start.sh

EXPOSE $PORT
CMD ["./start.sh"]
```

### Step 3: Environment Variables for Track 1
Set these in Railway dashboard:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME_AUTH=healthtech_auth
DB_NAME_FEEDBACK=healthtech_feedback
DB_NAME_REMINDER=healthtech_reminders
DB_NAME_NOTIFICATION=healthtech_notifications
DB_NAME_TRANSLATION=healthtech_translations

# Security
JWT_SECRET=your-super-secure-jwt-secret-for-production

# Twilio (optional for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=3000
```

## 🤖 Track 2 Deployment (AI Chatbot)

### Step 1: Create Railway Dockerfile for Track 2
```dockerfile
# Dockerfile.railway.track2
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY feedback-reminder-system/feedback-ui-service/package*.json ./
RUN npm ci
COPY feedback-reminder-system/feedback-ui-service/ ./
ENV NEXT_PUBLIC_CHATBOT_API_URL=/api/chat
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY chatbot/requirements.txt ./
RUN pip install -r requirements.txt

# Copy application code
COPY chatbot/ ./chatbot/
COPY shared/ ./shared/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./static/

# Create startup script
RUN echo '#!/bin/bash\n\
python -m uvicorn chatbot.main:app --host 0.0.0.0 --port $(($PORT + 1)) &\n\
python -m http.server $PORT --directory static\n\
wait' > start.sh && chmod +x start.sh

EXPOSE $PORT
CMD ["./start.sh"]
```

### Step 2: Environment Variables for Track 2
```env
# Google AI
GOOGLE_API_KEY=your_google_gemini_api_key

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=healthtech_chatbot

# RAG Configuration
CHUNK_SIZE=200
CHUNK_OVERLAP=50

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=3000
```

## 🚀 Deployment Steps

### 1. Setup MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for Railway
5. Get connection string

### 2. Setup Google AI API (Free tier)
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create API key
3. Copy the key for Track 2

### 3. Deploy to Railway

#### Track 1 Deployment:
```bash
# 1. Push to GitHub
git add .
git commit -m "Railway deployment configuration"
git push origin railway-deployment

# 2. In Railway dashboard:
# - Connect GitHub repository
# - Select railway-deployment branch
# - Use Dockerfile.railway
# - Set environment variables
# - Deploy
```

#### Track 2 Deployment:
```bash
# Create separate service for Track 2
# Use Dockerfile.railway.track2
# Set Track 2 environment variables
# Deploy
```

## 🌐 Alternative: Vercel + Render Deployment

### Frontend (Vercel) - Free
```bash
# Deploy frontend to Vercel
cd feedback-reminder-system/feedback-ui-service
npx vercel --prod

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_CHATBOT_API_URL=https://your-render-backend.onrender.com
```

### Backend (Render) - Free Tier
1. Connect GitHub to Render
2. Create Web Service
3. Use Docker deployment
4. Set environment variables
5. Deploy

## 📱 Mobile App Deployment

### Expo EAS (Free tier)
```bash
cd feedback-reminder-system/mobile

# Install EAS CLI
npm install -g @expo/eas-cli

# Configure for production
eas build:configure

# Update app.json
{
  "expo": {
    "name": "HealthTech Assistant",
    "slug": "healthtech-assistant",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}

# Build and submit
eas build --platform all
eas submit --platform all
```

## 🔗 Final URLs for Judges

After deployment, you'll have:

### Track 1 (Patient Communication):
- **Web App**: `https://healthtech-track1.railway.app`
- **API Docs**: `https://healthtech-track1.railway.app/docs`

### Track 2 (AI Chatbot):
- **Web App**: `https://healthtech-track2.railway.app`
- **Mobile App**: Available on App Store/Play Store
- **API**: `https://healthtech-track2.railway.app/api`

## 💰 Cost Estimation
- **Railway**: $5 free credit (lasts 2-3 weeks for demo)
- **MongoDB Atlas**: Free tier (512MB)
- **Google AI API**: Free tier (60 requests/minute)
- **Vercel**: Free tier (100GB bandwidth)
- **Render**: Free tier (750 hours/month)

## 🛠️ Monitoring & Maintenance
- Railway provides built-in monitoring
- Set up health checks
- Monitor usage to stay within free limits
- Scale up if needed during judging period
