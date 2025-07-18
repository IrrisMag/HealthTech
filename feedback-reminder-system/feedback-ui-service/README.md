# Feedback UI Service (Hospital)

A Next.js web interface for hospital staff to view, search, and manage patient feedback.

## Features
- View and manage patient feedback
- Secure authentication via the Auth service (JWT)
- API calls to the feedback microservice
- Docker & Traefik integration

## Configuration
Set environment variables in `.env.local`:
```
NEXT_PUBLIC_FEEDBACK_API_URL=http://feedback.localhost
NEXT_PUBLIC_AUTH_API_URL=http://auth.localhost
```

## Local Development
```bash
yarn install
yarn dev
```
Access: http://localhost:3000 (or http://feedback-ui.localhost via Traefik)

## Production (Docker)
```bash
docker build -t feedback-ui-service .
docker run -p 3000:3000 --env-file .env.local feedback-ui-service
```

## Microservices Integration
- API calls use environment variables to reach backend services via Traefik
- JWT token is stored client-side and sent in the Authorization header for protected requests

## Navigation
- Home: `app/page.tsx`
- Feedback list: `app/feedback/page.tsx`

## Security
- Access protected by JWT authentication
- Role-based access control enforced by backend
