# 🚀 HealthTech Platform - Tracks Deployment Guide

## 📋 **OVERVIEW**

The HealthTech platform is organized into **3 independent tracks**, each with its own services and MongoDB Atlas databases. This modular architecture enables independent development and deployment.

**Current Status**: Track 1 is fully deployed and operational. **Track 2 is implemented and integrated**. Track 3 is planned for future development.

---

## 🏗️ **TRACKS ARCHITECTURE**

### **✅ Track 1: Patient Communication & Feedback (DEPLOYED)**
```
Architecture: Frontend (Local) + Backend (Docker) + MongoDB Atlas
Services: Auth + Feedback + Reminder + Notification + Translation + Frontend
Database: MongoDB Atlas (healthtech.khb7ck1.mongodb.net)
Traefik: localhost:8001 (Dashboard: localhost:8081)
Frontend: localhost:3000
```

**Features:**
- **🔐 Auth Service**: JWT authentication & role-based authorization
- **💬 Feedback Service**: Patient feedback collection with sentiment analysis
- **⏰ Reminder Service**: Appointment reminders & scheduling
- **📢 Notification Service**: SMS/Email delivery via Twilio
- **🌍 Translation Service**: Multi-language content support
- **🌐 Frontend UI**: Next.js web application for patient interaction
- **📊 Analytics**: Real-time feedback analytics dashboard

**Databases:**
- `healthtech_auth` - User authentication & authorization
- `healthtech_feedback` - Patient feedback & sentiment analysis
- `healthtech_reminders` - Appointment reminders & scheduling
- `healthtech_notifications` - Notification delivery logs
- `healthtech_translations` - Multi-language content

### **✅ Track 2: AI-Powered Patient Support (IMPLEMENTED!)**
```
Architecture: RAG Chatbot + Frontend Integration + Document Processing
Services: RAG Chatbot + Web Interface + Mobile Interface + Document Processing
Database: Session Memory + PDF Documents
API: localhost:8000
Frontend Integration: localhost:3000/chatbot
Mobile Integration: Expo app /chatbot
```

**Implemented Features:**
- **🤖 RAG Chatbot Service**: AI medical assistant with document-based responses
- **📚 Document Processing**: Automatic PDF processing and knowledge extraction
- **🧠 Conversation Memory**: Context-aware responses across sessions
- **📋 Source Attribution**: Transparent sourcing from medical documents
- **🎯 Confidence Scoring**: Response reliability indicators
- **🌐 Web Interface**: Integrated chatbot UI in main application
- **📱 Mobile Interface**: Native mobile chatbot interface
- **🔗 Seamless Integration**: Connected with Track 1 services

**Data Storage:**
- Session-based conversation memory
- PDF document processing and storage
- Medical knowledge extraction and indexing

### **📊 Track 3 : Analytics & Data**
```
Services: Auth + Analysis + Data
Port MongoDB: 27019
Traefik: localhost:82 (Dashboard: 8082)
```

**Fonctionnalités :**
- **Auth** : Authentification partagée
- **Analysis** : Analyse de données de santé
- **Data** : Gestion sécurisée des données patients

---

## 🚀 **DÉPLOIEMENT**

### **Prérequis**
```bash
# Installer les dépendances
sudo apt update
sudo apt install docker.io docker-compose python3 python3-pip curl

# Cloner le repository
git clone <repository-url>
cd HealthTech

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

### **Environment Configuration**
```bash
# Current .env configuration (Track 1)
# MongoDB Atlas
MONGODB_CLUSTER_URI=mongodb+srv://irris:irris@healthtech.khb7ck1.mongodb.net/?retryWrites=true&w=majority&appName=healthtech
MONGODB_LOCAL_URI=mongodb://mongo:27017
MONGODB_URI=${MONGODB_CLUSTER_URI}

# Database Names (per service)
DB_NAME_AUTH=healthtech_auth
DB_NAME_FEEDBACK=healthtech_feedback
DB_NAME_REMINDER=healthtech_reminders
DB_NAME_NOTIFICATION=healthtech_notifications
DB_NAME_TRANSLATION=healthtech_translations

# Twilio Configuration (Track 1) - Replace with your credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:19006

# Security
JWT_SECRET=your-super-secure-jwt-secret
```

---

## 🎯 **COMMANDES DE DÉPLOIEMENT**

### **Track 1 - Communication**
```bash
# Déploiement complet
./deploy_track1.sh

# Ou manuellement
docker-compose -f docker-compose.track1.yml up --build -d

# Vérification
curl http://auth.localhost/health
curl http://reminder.localhost/health
```

### **Track 2 - IA**
```bash
# Déploiement complet
./deploy_track2.sh

# Ou manuellement
docker-compose -f docker-compose.track2.yml up --build -d

# Vérification
curl http://auth-track2.localhost/health
curl http://chatbot.localhost/health
```

### **Track 3 - Analytics**
```bash
# Déploiement complet
./deploy_track3.sh

# Ou manuellement
docker-compose -f docker-compose.track3.yml up --build -d

# Vérification
curl http://auth-track3.localhost/health
curl http://analysis.localhost/health
```

---

## 🌐 **ENDPOINTS PAR TRACK**

### **Track 1 Endpoints**
```
http://auth.localhost          - Service d'authentification
http://reminder.localhost      - Gestion des rappels
http://feedback.localhost      - Système de feedback
http://notification.localhost  - Service de notifications
http://translation.localhost   - Service de traduction
http://localhost:8080          - Traefik Dashboard
```

### **Track 2 Endpoints**
```
http://auth-track2.localhost   - Service d'authentification
http://chatbot.localhost       - Chatbot IA médical
http://localhost:8081          - Traefik Dashboard
```

### **Track 3 Endpoints**
```
http://auth-track3.localhost   - Service d'authentification
http://analysis.localhost      - Analyse de données
http://data.localhost          - Gestion des données
http://localhost:8082          - Traefik Dashboard
```

---

## 🗄️ **BASES DE DONNÉES MONGODB**

### **Séparation par Service**
```
Track 1:
├── reminderdb_auth          (Authentification)
├── reminderdb_reminder      (Rappels)
├── reminderdb_feedback      (Retours)
├── reminderdb_notification  (Notifications)
└── reminderdb_translation   (Traductions)

Track 2:
├── reminderdb_auth          (Authentification partagée)
└── reminderdb_chatbot       (Conversations IA)

Track 3:
├── reminderdb_auth          (Authentification partagée)
├── reminderdb_analysis      (Analyses)
└── reminderdb_data          (Données patients)
```

### **Gestion MongoDB**
```bash
# Setup toutes les bases
python3 scripts/mongodb_manager.py --action setup

# Statistiques
python3 scripts/mongodb_manager.py --action stats

# Backup d'un service
python3 scripts/mongodb_manager.py --action backup --service auth
```

---

## 🔧 **GESTION DES SERVICES**

### **Commandes Utiles**
```bash
# Voir les logs d'un track
docker-compose -f docker-compose.track1.yml logs -f

# Redémarrer un service
docker-compose -f docker-compose.track1.yml restart auth

# Arrêter un track
docker-compose -f docker-compose.track1.yml down

# Rebuild un service
docker-compose -f docker-compose.track1.yml up --build auth
```

### **Monitoring**
```bash
# Status des services
docker-compose -f docker-compose.track1.yml ps

# Utilisation des ressources
docker stats

# Logs en temps réel
docker-compose -f docker-compose.track1.yml logs -f --tail=100
```

---

## 🔒 **SÉCURITÉ**

### **Authentification**
- **Comptes admin par défaut** : `admin@hospital.com` / `admin123`
- **⚠️ IMPORTANT** : Changer le mot de passe immédiatement !
- **JWT Tokens** : Configurés pour 8h (durée d'un shift hospitalier)

### **Isolation des Données**
- **Bases séparées** : Chaque service a sa propre base MongoDB
- **Ports différents** : Évite les conflits entre tracks
- **Réseaux Docker** : Isolation au niveau réseau

---

## 🚨 **TROUBLESHOOTING**

### **Problèmes Courants**
```bash
# Port déjà utilisé
sudo netstat -tulpn | grep :80
sudo fuser -k 80/tcp

# Service ne démarre pas
docker-compose -f docker-compose.track1.yml logs service_name

# Base de données inaccessible
docker exec -it healthtech-mongo-1 mongosh
```

### **Nettoyage**
```bash
# Arrêter tous les tracks
docker-compose -f docker-compose.track1.yml down
docker-compose -f docker-compose.track2.yml down
docker-compose -f docker-compose.track3.yml down

# Nettoyer les volumes (⚠️ PERTE DE DONNÉES)
docker volume prune

# Rebuild complet
docker system prune -a
```

---

## 📈 **DÉVELOPPEMENT**

### **Développement Local**
```bash
# Utiliser MongoDB local
export MONGODB_URI=mongodb://localhost:27017

# Mode développement avec logs détaillés
export ENVIRONMENT=development
export LOG_LEVEL=DEBUG
```

### **Tests**
```bash
# Tests d'intégration par track
curl -X POST http://auth.localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Test du chatbot
curl -X POST http://chatbot.localhost/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour, comment allez-vous?"}'
```

---

## 🎯 **PRODUCTION**

### **Checklist de Déploiement**
- [ ] Configurer MongoDB Atlas
- [ ] Mettre à jour les secrets JWT
- [ ] Configurer Twilio (Track 1)
- [ ] Configurer OpenAI (Track 2)
- [ ] Activer HTTPS
- [ ] Configurer les backups
- [ ] Mettre en place le monitoring

### **Variables de Production**
```bash
export ENVIRONMENT=production
export MONGODB_URI=${MONGODB_CLUSTER_URI}
export LOG_LEVEL=WARNING
```

---

*Cette architecture modulaire permet un développement et déploiement flexible, avec une séparation claire des responsabilités entre les différents tracks de la plateforme HealthTech.*
