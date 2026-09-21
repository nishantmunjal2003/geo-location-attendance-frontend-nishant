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

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy custom Nginx configuration for React SPA routing & caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
