# Dockerfile for Expo React Native mobile app
FROM node:20-alpine

# Install Expo CLI globally
RUN npm install -g @expo/cli

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile || npm install

# Copy source code
COPY . .

# Expose port for Expo web
EXPOSE 19006

# Start Expo web server
CMD ["yarn", "web"]
