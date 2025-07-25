# 🗄️ MongoDB Architecture - HealthTech Platform

## 📊 **DATABASE STRUCTURE**

### **🏥 Multi-Database Architecture**
```
MongoDB Cluster: reminderdb.yhiiqvg.mongodb.net
├── reminderdb_analysis      # Health data analysis
├── reminderdb_auth          # Authentication & authorization  
├── reminderdb_chatbot       # AI chatbot conversations
├── reminderdb_data          # Patient data management
├── reminderdb_event         # Event scheduling & management
├── reminderdb_feedback      # User feedback & ratings
├── reminderdb_forecast      # Predictive analytics
├── reminderdb_notification  # Notification delivery
├── reminderdb_optimization  # Resource optimization
├── reminderdb_reminder      # Appointment reminders
└── reminderdb_translation   # Multi-language support
```

---

## 🔧 **CONFIGURATION MANAGEMENT**

### **Environment Variables**
```bash
# Production (MongoDB Atlas)
MONGODB_CLUSTER_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_URI=${MONGODB_CLUSTER_URI}

# Development (Local MongoDB)  
MONGODB_LOCAL_URI=mongodb://mongo:27017
MONGODB_URI=${MONGODB_LOCAL_URI}

# Database Names
DB_NAME_AUTH=reminderdb_auth
DB_NAME_ANALYSIS=reminderdb_analysis
# ... (one per service)
```

```

---

## 🏗️ **DATABASE SCHEMAS**

### **🔐 Auth Database (reminderdb_auth)**
```javascript
// Users Collection
{
  _id: ObjectId,
  email: "doctor@hospital.com",
  hashed_password: "bcrypt_hash",
  full_name: "Dr. John Smith",
  role: "doctor",
  employee_id: "DOC0001", 
  department: "cardiology",
  is_active: true,
  created_at: ISODate,
  permissions: ["read_patient_data", "prescribe_medication"],
  approval_status: "approved",
  last_login: ISODate,
  mfa_enabled: false
}

// Audit Logs Collection
{
  _id: ObjectId,
  timestamp: ISODate,
  user_id: "user_object_id",
  user_email: "doctor@hospital.com",
  action: "login_success",
  resource: "patient_data",
  severity: "medium",
  ip_address: "192.168.1.100",
  success: true
}
```

### **📊 Analysis Database (reminderdb_analysis)**
```javascript
// Health Data Collection
{
  _id: ObjectId,
  patient_id: "patient_object_id",
  data_type: "vitals",
  measurements: {
    blood_pressure: "120/80",
    heart_rate: 72,
    temperature: 98.6
  },
  recorded_at: ISODate,
  recorded_by: "nurse_object_id"
}
```

### **💬 Feedback Database (reminderdb_feedback)**
```javascript
// Feedback Collection
{
  _id: ObjectId,
  patient_id: "patient_object_id",
  service_type: "appointment",
  rating: 5,
  comment: "Excellent service",
  created_at: ISODate,
  department: "cardiology"
}
```

---

## 🚀 **DEPLOYMENT STRATEGIES**

### **Development Environment**
- **Local MongoDB**: Docker container with replica set
- **Database**: Separate databases per service
- **Transactions**: Supported via replica set
- **Backup**: Local file system

### **Production Environment**  
- **MongoDB Atlas**: Managed cloud service
- **Cluster**: M10+ for production workloads
- **Security**: VPC peering, IP whitelisting
- **Backup**: Automated Atlas backups
- **Monitoring**: Atlas monitoring + alerts

---

## 🔒 **SECURITY CONFIGURATION**

### **Authentication**
```javascript
// MongoDB Atlas Security
- Username/Password authentication
- Database-specific users
- Role-based access control (RBAC)
- Network access restrictions
```

### **Connection Security**
```bash
# TLS/SSL encryption in transit
mongodb+srv://user:pass@cluster.mongodb.net/?ssl=true

# Application-level encryption
- Sensitive fields encrypted at application layer
- JWT tokens for service authentication
- Audit logging for all database operations
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Indexing Strategy**
```javascript
// Common Indexes (All Services)
db.collection.createIndex({ "created_at": 1 })
db.collection.createIndex({ "updated_at": 1 })

// Auth Service Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "employee_id": 1 })
db.users.createIndex({ "role": 1 })
db.audit_logs.createIndex({ "timestamp": 1 })
db.audit_logs.createIndex({ "user_id": 1 })

// Service-Specific Indexes
db.patient_data.createIndex({ "patient_id": 1 })
db.appointments.createIndex({ "appointment_date": 1 })
```

### **Connection Pooling**
```python
# Motor (AsyncIO MongoDB driver)
client = AsyncIOMotorClient(
    mongodb_uri,
    maxPoolSize=50,
    minPoolSize=10,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000
)
```

---

## 🛠️ **MANAGEMENT TOOLS**

### **MongoDB Manager Script**
```bash
# Setup all databases and indexes
python scripts/mongodb_manager.py --action setup

# Get database statistics
python scripts/mongodb_manager.py --action stats

# List all HealthTech databases
python scripts/mongodb_manager.py --action list

# Backup specific service
python scripts/mongodb_manager.py --action backup --service auth
```

### **Health Checks**
```bash
# Test MongoDB connectivity
curl http://localhost:8000/health

# Check database status
docker exec mongo mongosh --eval "db.adminCommand('ping')"
```

---

## 📋 **BACKUP & RECOVERY**

### **Automated Backups (Production)**
- **Atlas Backups**: Continuous, point-in-time recovery
- **Retention**: 7 days (configurable)
- **Cross-region**: Backup to different region

### **Manual Backups (Development)**
```bash
# Backup specific database
mongodump --uri="mongodb://localhost:27017" --db=reminderdb_auth --out=./backups/

# Restore database
mongorestore --uri="mongodb://localhost:27017" --db=reminderdb_auth ./backups/reminderdb_auth/
```

---

## 🔍 **MONITORING & ALERTS**

### **Key Metrics**
- **Connection Count**: Monitor active connections
- **Query Performance**: Slow query detection
- **Storage Usage**: Database size growth
- **Replication Lag**: For replica sets

### **Atlas Monitoring**
- **Real-time Metrics**: CPU, memory, disk I/O
- **Custom Alerts**: Performance thresholds
- **Query Profiler**: Identify slow operations

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**
```bash
# Connection timeout
- Check network connectivity
- Verify connection string
- Check IP whitelist (Atlas)

# Authentication failed
- Verify username/password
- Check database permissions
- Validate connection string format

# Slow queries
- Review query patterns
- Add appropriate indexes
- Use query profiler
```

### **Debug Commands**
```javascript
// Check connection status
db.adminCommand("ping")

// List databases
show dbs

// Check indexes
db.collection.getIndexes()

// Query profiler
db.setProfilingLevel(2)
db.system.profile.find().limit(5).sort({ts:-1}).pretty()
```

---

## 📊 **CAPACITY PLANNING**

### **Storage Estimates**
- **Auth Database**: ~100MB (10K users)
- **Patient Data**: ~1GB per 1K patients
- **Audit Logs**: ~10GB per year (high activity)
- **Total Estimated**: ~50GB for medium hospital

### **Scaling Strategy**
- **Vertical Scaling**: Increase cluster tier (M10 → M20 → M30)
- **Horizontal Scaling**: Sharding for large datasets
- **Read Replicas**: For read-heavy workloads

---

## 🤖 **TRACK 2: AI CHATBOT DATA ARCHITECTURE**

### **Session Memory System**
Track 2 uses a session-based memory system for conversation management:

```javascript
// Conversation Session (In-Memory)
{
  session_id: "web_1234567890",
  messages: [
    {
      role: "user",
      content: "What are the symptoms of malaria?",
      timestamp: ISODate
    },
    {
      role: "assistant",
      content: "Based on medical documents, malaria symptoms include...",
      sources: ["Malaria_guide.pdf"],
      confidence: 0.85,
      timestamp: ISODate
    }
  ],
  created_at: ISODate,
  last_activity: ISODate
}
```

### **Document Processing System**
```javascript
// Document Metadata (File-based)
{
  filename: "Malaria_guide.pdf",
  pages: 25,
  chunks: 30,
  processed_at: ISODate,
  file_size: "2.5MB",
  status: "processed"
}

// Document Chunks (RAG System)
{
  chunk_id: "malaria_guide_chunk_001",
  content: "Malaria is a life-threatening disease...",
  source_file: "Malaria_guide.pdf",
  page_number: 1,
  chunk_index: 0,
  keywords: ["malaria", "symptoms", "fever", "treatment"]
}
```

### **Track 2 Data Flow**
```
User Query → Session Memory → Document Search → AI Processing → Response with Sources
```

### **Integration with Track 1**
- **No direct database integration**: Track 2 operates independently
- **Frontend integration**: Seamless UI integration via API calls
- **Session isolation**: Each conversation is independent
- **Document-based knowledge**: Medical PDFs provide knowledge base

---

*This modular MongoDB architecture enables clear separation of responsibilities and optimal scalability for the HealthTech platform, with Track 2 providing AI capabilities through session-based memory and document processing.*
