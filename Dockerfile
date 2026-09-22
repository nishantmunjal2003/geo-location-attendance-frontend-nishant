# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables with sensible defaults
ARG REACT_APP_URL=https://gkv.rajeevsahu.me/api
ARG REACT_APP_GOOGLE_CLIENT_ID=761450022754-jblgjbq21hhjdc6rnusd2e8c7807e9b4.apps.googleusercontent.com
ARG REACT_APP_MAIL_FROM_ADDRESS=noreply@gkv.ac.in
ARG REACT_APP_MAIL_FROM_NAME="GKV Attendance App"

ENV REACT_APP_URL=$REACT_APP_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_MAIL_FROM_ADDRESS=$REACT_APP_MAIL_FROM_ADDRESS
ENV REACT_APP_MAIL_FROM_NAME=$REACT_APP_MAIL_FROM_NAME

# Prevent ESLint warnings from failing the production build
ENV CI=false

# Build production assets
RUN npm run build

# Stage 2: Production Node.js Server (handles React SPA + /api/send-email proxy)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install Express for the production proxy/SPA server
COPY package*.json ./
RUN npm install express --legacy-peer-deps

# Copy built React static assets from builder stage
COPY --from=builder /app/build ./build

# Copy production server script
COPY server.js ./

# Expose Node.js production port
EXPOSE 3000

# Health check targeting the test endpoint
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/test-email-config || exit 1

CMD ["node", "server.js"]
