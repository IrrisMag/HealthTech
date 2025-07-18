# Feedback & Reminder System

This directory contains all frontend and backend services for patient feedback and reminder management at Douala General Hospital.

## Structure
- `feedback-ui-service/`: Web UI (Next.js) for hospital staff to manage patient feedback
- `reminder-service/`: Web UI (Next.js) for hospital staff to manage reminders
- `mobile/`: Mobile app (Expo/React Native) for patients to submit and view feedback
- Other folders: additional microservices and modules

## Quick Start (Docker + Traefik)
1. Ensure Docker and Docker Compose are installed.
2. Add to `/etc/hosts`:
   ```
   127.0.0.1 feedback.localhost auth.localhost reminder.localhost feedback-ui.localhost reminder-ui.localhost feedback-mobile.localhost
   ```
3. Start all services:
   ```bash
   docker-compose up --build
   ```
4. Access UIs:
   - Feedback Web (Hospital): http://feedback-ui.localhost
   - Reminder Web (Hospital): http://reminder-ui.localhost
   - Feedback Mobile (Patient): http://feedback-mobile.localhost

## Microservices Integration
- All frontends communicate with backends via Traefik (see each service's `.env.local`)
- Centralized authentication via the Auth service
- JWT and role-based access control for security

## Documentation
See each service's README.md for detailed usage and configuration.
