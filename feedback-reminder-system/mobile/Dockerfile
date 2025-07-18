# Dockerfile for Next.js frontend (mobile)
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile || npm install
RUN yarn build || npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["yarn", "start"]
