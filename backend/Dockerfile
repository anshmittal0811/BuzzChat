# Multi-stage Dockerfile for NestJS monorepo
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --only=production && npm cache clean --force

# Build the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Build argument to specify which app to build
ARG APP_NAME
RUN npm run build ${APP_NAME}

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy the standalone output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create directories for asset uploads and set permissions
RUN mkdir -p /app/dist/temp_chunks /app/uploads /app/temp \
    && chown -R nestjs:nodejs /app/dist/temp_chunks /app/uploads /app/temp \
    && chmod -R 755 /app/dist/temp_chunks /app/uploads /app/temp

USER nestjs

# Build argument to specify which app to run
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Expose common ports (will be mapped in docker-compose)
EXPOSE 3000 3001 3002 3003 5000

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"] 