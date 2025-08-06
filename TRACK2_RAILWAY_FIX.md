# Track 2 Railway Deployment Fix

## Problem Diagnosis

The Track 2 backend deployment on Railway was failing with:
```
ModuleNotFoundError: No module named 'fastapi'
```

## Root Cause Analysis

1. **Dependencies Issue**: The requirements.txt file was incomplete
2. **Dockerfile Configuration**: Railway was using the wrong Dockerfile or configuration
3. **Path Issues**: The application structure wasn't properly configured for Railway

## Solution Implemented

### 1. Updated Requirements Files

**Updated `chatbot/requirements.txt`:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
google-generativeai==0.3.2
pypdf==3.17.4
python-multipart==0.0.6
python-dotenv==1.0.0
requests==2.31.0
aiofiles==23.2.1
httpx==0.25.2
```

**Updated `chatbot/patient_support/requirements.txt`** to match.

### 2. Created Railway-Specific Dockerfile

**New `chatbot/Dockerfile.railway`:**
- Uses Python 3.11-slim base image
- Installs system dependencies (gcc, g++, curl)
- Properly copies and installs requirements
- Sets correct environment variables
- Uses uvicorn to run the FastAPI application

### 3. Updated Railway Configuration

**Updated `chatbot/railway.toml`:**
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway"

[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/health"
healthcheckTimeout = 300

[environments.production.variables]
ENVIRONMENT = "production"
LOG_LEVEL = "INFO"
PORT = "8000"
```

## Deployment Steps

### Quick Fix (Recommended)

1. **Run the fix script:**
   ```bash
   ./fix_track2_railway.sh
   ```

2. **Monitor deployment:**
   ```bash
   cd chatbot
   railway logs --tail 50
   ```

### Manual Deployment

1. **Navigate to chatbot directory:**
   ```bash
   cd chatbot
   ```

2. **Deploy to Railway:**
   ```bash
   railway up --detach
   ```

3. **Check status:**
   ```bash
   railway status
   railway logs
   ```

## Environment Variables Required

Set these in Railway dashboard:

1. **GOOGLE_API_KEY** (Required)
   - Your Google Gemini API key
   - Get from: https://makersuite.google.com/app/apikey

2. **PORT** (Auto-set by Railway)
   - Railway automatically sets this
   - Default: 8000

3. **ENVIRONMENT** (Optional)
   - Set to "production"

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

### 2. API Documentation
Visit: `https://your-app.railway.app/docs`

### 3. Chat Endpoint
```bash
curl -X POST https://your-app.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I have a headache", "session_id": "test"}'
```

### 4. Automated Testing
```bash
python test_track2_deployment.py https://your-app.railway.app
```

## Expected Endpoints

After successful deployment, these endpoints should be available:

- `GET /` - Root endpoint with service info
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- `GET /api` - API information
- `POST /chat` - Main chatbot endpoint
- `DELETE /clear-memory` - Clear conversation memory
- `POST /upload-document` - Upload medical documents

## Troubleshooting

### If deployment still fails:

1. **Check Railway logs:**
   ```bash
   railway logs --tail 100
   ```

2. **Verify files exist:**
   ```bash
   ls -la chatbot/
   cat chatbot/requirements.txt
   cat chatbot/railway.toml
   ```

3. **Test locally first:**
   ```bash
   cd chatbot
   pip install -r requirements.txt
   python -m uvicorn main:app --reload
   ```

### Common Issues:

1. **Missing API Key**: Set GOOGLE_API_KEY in Railway dashboard
2. **Port Issues**: Railway automatically sets PORT, don't override
3. **Build Timeout**: Increase healthcheckTimeout in railway.toml
4. **Memory Issues**: Consider upgrading Railway plan

## Success Indicators

✅ **Deployment successful when:**
- Health check returns 200 status
- API docs accessible at /docs
- Chat endpoint responds to POST requests
- No "ModuleNotFoundError" in logs

## Next Steps

1. **Configure Frontend**: Update frontend to use new Railway URL
2. **Set up Monitoring**: Use Railway's built-in monitoring
3. **Add Custom Domain**: Configure custom domain if needed
4. **Scale if Needed**: Adjust replicas based on usage

## Support

If issues persist:
1. Check Railway dashboard for detailed logs
2. Verify all environment variables are set
3. Test endpoints manually with curl or Postman
4. Review the application logs for specific error messages
