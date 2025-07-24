# Dockerfile for Next.js frontend (feedback-ui-service)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app ./

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["yarn", "start"]
