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
1. Clone the repository and ensure Docker & Docker Compose are installed.
2. Add the following to your `/etc/hosts`:
   ```
   127.0.0.1 feedback.localhost auth.localhost reminder.localhost feedback-ui.localhost reminder-ui.localhost feedback-mobile.localhost
   ```
3. Build and start all services:
   ```bash
   docker-compose up --build
   ```
4. Access the main UIs:
   - Feedback Web (Hospital): http://feedback-ui.localhost
   - Reminder Web (Hospital): http://reminder-ui.localhost
   - Feedback Mobile (Patient): http://feedback-mobile.localhost

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
