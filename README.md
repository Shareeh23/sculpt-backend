# Sculpt Backend

## Overview

Sculpt is an AI-powered fitness platform backend API built with Node.js, TypeScript, and Express. The backend handles workout plan generation, logging, nutrition tracking, analysis, and file management. It integrates with MongoDB for data persistence and Redis for caching.

## Features

- **Workout Plan Generation**: AI-powered workout plan generation using OpenAI, with Redis reuse for matching character and training-day requests
- **Workout Logging**: Log and track workout sessions with sets and reps
- **1RM Calculation**: Calculate one-rep max for weight training
- **Predefined Workout Plans**: Library of predefined workout plans
- **Nutrition Tracking**: Profile management and macro calculation
- **Exercise Analysis**: Insights and recommendations for exercises
- **File Upload**: S3 presigned URLs for profile pictures and workout plan images
- **Authentication**: Better Auth for email/password and Google OAuth
- **CORS**: Configured for frontend integration
- **Rate Limiting**: Applied to general API, AI generation, and file upload endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Statically typed language (target: ES2022)
- **Express** - Web framework (v5)
- **MongoDB** - Document database (v7+ with Mongoose)
- **Redis** - Cached AI workout-plan templates
- **Better Auth** - Authentication and user management
- **Zod** - Schema validation
- **Pino** - Logging
- **Docker** - Containerization

## Architecture

The application follows a layered architecture:

```text
Client
  │
  ├─▶ HTTP Server (Express)
  │
  ├─▶ CORS Middleware
  │
  ├─▶ Request ID Middleware
  │
  ├─▶ HTTP Request Logger (Pino)
  │
  ├─▶ Better Auth (Authentication)
  │
  ├─▶ Route Dispatch
  │   ├─▶ /api/v1/workout/*
  │   ├─▶ /api/v1/nutrition/*
  │   ├─▶ /api/v1/analysis/*
  │   ├─▶ /api/v1/files/*
  │   └─▶ /api/v1/predefined-plans/*
  │
  ├─▶ Protected Routes (require-auth)
  │
  ├─▶ Route-Specific Middleware
  │   ├─▶ Validation (Zod schemas)
  │   ├─▶ Rate Limiting
  │   └─▶ Other route-specific middleware
  │
  ├─▶ Controller
  │   ├─▶ Receives request
  │   ├─▶ Calls service layer
  │   └─▶ Returns JSON response
  │
  ├─▶ Service Layer
  │   ├─▶ Business logic
  │   ├─▶ Calls repository
  │   └─▶ Returns data
  │
  ├─▶ Repository
  │   ├─▶ MongoDB data access
  │   └─▶ Returns Mongoose documents
  │
  └─▶ MongoDB
```

### Key Components

- **Authentication**: Better Auth handles registration, login, and session management
- **Authorization**: `require-auth` middleware protects routes
- **Validation**: Zod schemas validate all request bodies and parameters
- **Error Handling**: Central error handler middleware with structured responses
- **Logging**: Pino HTTP request logging with structured output

Project structure documentation is available in `docs/architecture.md`.

## Project Structure

```text
src/
├── app.ts              # Express application entry point
├── server.ts           # Server bootstrap
├── config/             # Environment and configuration
├── routes/             # API route definitions
├── controllers/        # Request handlers
├── services/           # Business logic
├── repositories/       # Data access layer
├── middleware/         # Express middleware
├── models/             # MongoDB models
├── schemas/            # Zod validation schemas
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

Detailed architecture documentation is available in `docs/architecture.md`.

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- MongoDB instance (local or cloud)
- Redis instance (local or cloud)
- OpenAI API key (for AI workout generation)

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration. See the [Environment Variables](#environment-variables) section for details.

### Development

```bash
npm run dev
```

Runs the development server with Node's built-in watch mode and the `tsx` TypeScript loader.

### Production Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Production Start

```bash
npm start
```

Starts the compiled application from `dist/server.js`.

## Environment Variables

Copy `.env.example` to `.env` and replace its placeholder credentials. `MONGO_DB_NAME`, `REDIS_CACHE_TTL`, `NODE_ENV`, and `LOG_LEVEL` have defaults but can be configured:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
MONGO_DB_URL=your_mongodb_connection_string
MONGO_DB_NAME=sculpt
REDIS_URL=your_redis_connection_string
REDIS_CACHE_TTL=86400
BETTER_AUTH_URL=http://localhost:3000
OPENAI_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=ft:gpt-4.1-2025-04-14:personal:workout-plan-generator-v2:BrQ7lkRi
OPENAI_API_KEY=your_openai_api_key
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

### API

API documentation is available in `docs/api.md`.

### Testing

```bash
npm test        # Run test suite
npm run test:watch  # Run tests in watch mode
```

Type checking:

```bash
npx tsc --noEmit
```

Linting:

```bash
npm run lint
```

### Docker

Build the Docker image:

```bash
docker build -t sculpt-backend .
```

Run the container locally:

```bash
docker run --env-file .env -p 3000:3000 sculpt-backend
```

Verify the container is running by accessing the health endpoint:

```bash
curl http://localhost:3000/health
```

Docker documentation covers local development/use only.

## Troubleshooting

- **Container not starting**: Check that `.env` file exists and has valid values
- **MongoDB connection failure**: Verify `MONGO_DB_URL` is correct and MongoDB is running
- **Redis connection failure**: Verify `REDIS_URL` is correct and Redis is running
- **Port already in use**: Stop any other process using port 3000, or change the PORT variable
- **Authentication issues**: Verify `BETTER_AUTH_URL` and Better Auth configuration

## Documentation

- `docs/architecture.md` - Detailed technical architecture
- `docs/api.md` - Complete API reference
- `docs/development.md` - Development workflow guide
