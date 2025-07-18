# Reminder UI Service (Hospital)

A Next.js web interface for hospital staff to view, search, and manage reminders for patients.

## Features
- View and manage reminders
- Secure authentication via the Auth service (JWT)
- API calls to the reminder microservice
- Docker & Traefik integration

## Configuration
Set environment variables in `.env.local`:
```
NEXT_PUBLIC_REMINDER_API_URL=http://reminder.localhost
NEXT_PUBLIC_AUTH_API_URL=http://auth.localhost
```

## Local Development
```bash
yarn install
yarn dev
```
Access: http://localhost:3000 (or http://reminder-ui.localhost via Traefik)

## Production (Docker)
```bash
docker build -t reminder-ui-service .
docker run -p 3000:3000 --env-file .env.local reminder-ui-service
```

## Microservices Integration
- API calls use environment variables to reach backend services via Traefik
- JWT token is stored client-side and sent in the Authorization header for protected requests

## Navigation
- Home: `app/page.tsx`
- Reminders list: `app/reminder/page.tsx`

## Security
- Access protected by JWT authentication
- Role-based access control enforced by backend
