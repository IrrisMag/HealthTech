# HealthTech Platform - Douala General Hospital

This repository contains the full microservices-based platform for the "Co-Creating AI Solutions for Douala General Hospital (DGH)" project, including backend services, web frontends, and mobile applications.

## Main Tracks
- **Feedback & Reminder System**: Patient feedback collection, sentiment analysis, multilingual reminders (Track 1)
- **LLM Chatbot**: Patient education and support (Track 2)
- **Blood Bank Monitoring**: Stock management and forecasting (Track 3)

## Architecture
- Microservices (FastAPI, MongoDB, etc.)
- Frontends: Next.js (web), Expo/React Native (mobile)
- Traefik for reverse proxy and routing
- Docker & Docker Compose for orchestration

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ and npm installed

### Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd HealthTech
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB Atlas credentials, Twilio keys, etc.
   ```

3. **Add to your `/etc/hosts`**:
   ```bash
   echo "127.0.0.1 auth.localhost feedback.localhost reminder.localhost notification.localhost translation.localhost" | sudo tee -a /etc/hosts
   ```

4. **Start backend services**:
   ```bash
   docker-compose -f docker-compose.track1.yml up -d
   ```

5. **Start frontend application**:
   ```bash
   cd feedback-reminder-system/feedback-ui-service
   npm install
   npm run dev
   ```

6. **Access the application**:
   - **Main Web App**: http://localhost:3000
   - **Backend APIs**: http://*.localhost:8001
   - **Traefik Dashboard**: http://localhost:8081

## Services Overview
- See each subdirectory's README.md for service-specific setup, configuration, and usage instructions:
  - `feedback-reminder-system/feedback-ui-service/` (Web UI for feedback)
  - `feedback-reminder-system/reminder-service/` (Web UI for reminders)
  - `feedback-reminder-system/mobile/` (Mobile app for patient feedback)

## Security
- All sensitive endpoints are protected by JWT authentication and role-based access control via the Auth service.
- Frontends must store and send the JWT token in the Authorization header for protected API calls.

## Contribution
- Please read each service's README for development and deployment details.
- PRs and issues are welcome!
