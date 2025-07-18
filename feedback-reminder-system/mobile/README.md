# Mobile Feedback App (Patient)

An Expo/React Native mobile app for patients to submit and view their feedback.

## Features
- Submit feedback as a patient
- View feedback history
- Secure authentication via the Auth service (JWT)
- API calls to the feedback microservice
- Docker & Traefik integration for web version

## Configuration
Set environment variables in `.env.local`:
```
NEXT_PUBLIC_FEEDBACK_API_URL=http://feedback.localhost
NEXT_PUBLIC_AUTH_API_URL=http://auth.localhost
```

## Local Development (Expo)
```bash
npm install
npx expo start
```

## Web Version (Docker)
```bash
docker build -t feedback-mobile .
docker run -p 3000:3000 --env-file .env.local feedback-mobile
```

## Microservices Integration
- API calls use environment variables to reach backend services via Traefik
- JWT token is stored client-side and sent in the Authorization header for protected requests

## Security
- Access protected by JWT authentication
- Role-based access control enforced by backend
