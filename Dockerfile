# syntax=docker/dockerfile-upstream

# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for building)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and build
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript application
RUN NODE_OPTIONS="--max-old-space-size=640" npm run build

# Production stage
FROM node:22-alpine AS production
ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled output and the startup seed data.
COPY --from=builder /app/dist ./dist
COPY predefined-workout-plans.json ./

# Expose the port the application runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]