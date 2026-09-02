# Sculpt Backend - Architecture Documentation

## Architecture Overview

The Sculpt backend is a Node.js TypeScript application using Express.js as the web framework. It follows a layered architecture pattern with clear separation of concerns.

### High-Level Architecture

```text
Client Request
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

## Project Structure

### Source Directory Layout

```
src/
├── app.ts              # Express application assembly
├── server.ts           # Server bootstrap and startup
│
├── config/             # Environment and configuration
│   ├── env.ts          # Environment variable validation and types
│   ├── database.ts     # MongoDB connection setup
│   ├── redis.ts        # Redis connection setup
│   ├── s3.ts           # S3 client configuration
│   └── logger.ts       # Pino logger configuration
│
├── routes/             # Express route definitions
│   ├── workout.route.ts      # /api/v1/workout/*
│   ├── nutrition.route.ts    # /api/v1/nutrition/*
│   ├── analysis.route.ts     # /api/v1/analysis/*
│   ├── file.route.ts         # /api/v1/files/*
│   └── predefined-workout-plan.route.ts  # /api/v1/predefined-plans/*
│
├── controllers/        # Request handlers
│   ├── workout.controller.ts   # Workout plan/log operations
│   ├── nutrition.controller.ts # Nutrition profile operations
│   ├── analysis.controller.ts  # Exercise analysis
│   ├── file.controller.ts      # S3 upload URL generation
│   └── predefined-workout-plan.controller.ts  # Predefined plan operations
│
├── services/           # Business logic services
│   ├── workout.service.ts      # Workout orchestration
│   ├── 1rm.service.ts          # One-rep-max calculation
│   ├── workout-generation.service.ts  # AI workout generation
│   ├── analysis.service.ts      # Exercise-progress analysis
│   ├── nutrition.service.ts
│   ├── calorie-calculator.service.ts
│   ├── macro-calculator.service.ts
│   ├── file.service.ts
│   ├── email.service.ts
│   ├── cache.service.ts         # Redis AI-plan template cache
│   ├── predefined-workout-plan.service.ts
│   └── predefined-workout-plan-seeder.service.ts
│
├── repositories/       # Data access layer
│   ├── workout-plan.repository.ts
│   ├── workout-log.repository.ts
│   ├── nutrition.repository.ts
│   ├── predefined-workout-plan.repository.ts
│   └── analysis.repository.ts
│
├── middleware/         # Express middleware
│   ├── require-auth.ts         # Authentication check
│   ├── error-handler.ts        # Central error handling
│   ├── http-logger.ts          # Request logging
│   ├── rate-limit.ts           # Rate limiting
│   ├── request-id.ts           # Request tracking ID
│   ├── validate.ts             # Zod validation
│
├── models/             # Mongoose models
│   ├── workout-plan.model.ts
│   ├── workout-log.model.ts
│   ├── nutrition-profile.model.ts
│   └── predefined-workout-plan.model.ts
│
├── schemas/            # Zod validation schemas
│   ├── workout.schema.ts
│   ├── nutrition.schema.ts
│   ├── predefined-workout-plan.schema.ts
│   └── file.schema.ts
│
├── types/              # TypeScript type definitions
│   ├── analysis.types.ts
│   ├── express.d.ts
│   ├── file.types.ts
│   ├── nutrition.types.ts
│   ├── predefined-workout-plan.types.ts
│   ├── workout-log.types.ts
│   └── workout-plan.types.ts
│
└── utils/              # Utility functions
    ├── file-key.util.ts
    ├── workout-cache-key-util.ts
    └── workout-parser.util.ts
```

## Request Lifecycle

1. **Incoming Request** - Client sends HTTP request to the backend

2. **CORS Middleware** - Configures Cross-Origin Resource Sharing based on `env.FRONTEND_URL`

3. **Request ID** - Generates a unique request ID for tracking

4. **HTTP Logger** - Logs request details using Pino

5. **Better Auth** - Mounted at `/api/v1/auth/*splat`, handles session validation

6. **Body Parsing** - `express.json()` and `express.urlencoded()` parse request bodies

7. **Route Dispatch** - Request is directed to the appropriate router based on path

8. **Authentication Check** - `require-auth` middleware verifies the user session on protected routers

9. **Rate Limiting** - Applied per-router and per-route based on configuration

10. **Validation** - Zod schemas validate request body, params, and query parameters. Parsed request bodies, including schema defaults, are passed to controllers.

11. **Controller** - Handles the request, calls service layer, returns JSON response

12. **Service Layer** - Contains business logic, calls repositories, interacts with external services (OpenAI)

13. **Repository** - Mongoose operations for data persistence

14. **MongoDB** - Data storage and retrieval

15. **Response** - JSON response sent back to client with status, data, and optional message

## Authentication

### Mechanism

The application uses **Better Auth** for authentication and user management. Better Auth is mounted at the route prefix `/api/v1/auth/*splat` with a base path of `/api/v1/auth`.

### Protected Routes

Workout, nutrition, analysis, and file routes are protected and require a valid session. The predefined-workout-plan catalogue routes are public. On protected routes, the `require-auth` middleware attaches the authenticated user to `req.user`.

### Session/Token Handling

- Authentication is handled via HTTP-only cookies managed by Better Auth
- The `auth.api.getSession()` method retrieves the current session
- User information is available via `req.user` in protected routes

### How Authenticated User Information is Accessed

In controllers and services, the authenticated user's ID is accessed via `req.user!.id`. This ID is used to scope all data operations to the current user.

## Authorization

The `require-auth` middleware protects workout, nutrition, analysis, and file routes. Regular authenticated users can only access their own resources because data access is scoped by their user ID. The predefined-plan catalogue is intentionally public.

## Validation

### Validation Library

The application uses **Zod** for all request validation. Schemas are defined in `src/schemas/` and used via the `validate` middleware.

### Validation Layers

1. **Request Body** - Validated via Zod schemas in controllers
2. **Request Parameters** - Validated via Zod schemas
3. **Request Query** - Validated via Zod schemas

### Validation Flow

1. Middleware `validate(schema)` is called before the controller
2. If validation fails, a 422 response is returned with error details
3. If validation passes, the controller receives validated data

## Error Handling

### Error Handler Middleware

The application uses a central error handler middleware (`error-handler.ts`) that:

1. Catches async errors from controllers/services
2. Formats error responses consistently
3. Logs errors with request context

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "requestId": "unique-request-id",
  "errors": ["Validation errors details"]
}
```

### HTTP Status Codes

- **400** - Bad Request (invalid request handled outside route validation)
- **401** - Unauthorized (authentication required, invalid credentials)
- **422** - Unprocessable Content (route validation failed)
- **403** - Forbidden (admin privileges required)
- **404** - Not Found (resource not found)
- **409** - Conflict (duplicate resource, conflict)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error (unexpected error)

## MongoDB

### Integration

MongoDB is integrated using **Mongoose** (v9+). The connection is configured in `src/config/database.ts`.

### Connection Setup

- Connection string: `env.MONGO_DB_URL`
- Connection options: `maxPoolSize: 10`, `minPoolSize: 2`
- Database name: `env.MONGO_DB_NAME`, defaulting to `sculpt`

### Data Access Patterns

- **Repositories** - Each domain has a repository class (`src/repositories/`) that abstracts data access
- **Mongoose Models** - Defined in `src/models/` with schemas
- **Query Methods** - Standard find, findOne, create, update, delete operations
- **Population** - No model references are currently populated

### Models

- `WorkoutPlan` - Stores AI or predefined workout plans
- `WorkoutLog` - Stores logged workout sessions
- `NutritionProfile` - Stores user nutrition information
- `PredefinedWorkoutPlan` - Stores predefined workout plan library entries

## Redis

### Purpose

Redis is used to cache AI-generated workout plan templates.

### Integration Points

- AI plan templates are cached by normalized fictional-character archetype and training-day count.
- A cache hit is copied into the requesting user's workout-plan record, avoiding another AI inference.
- Cache TTL configuration via `env.REDIS_CACHE_TTL` (default: 86400 seconds = 24 hours)

### Connection

- Connection string: `env.REDIS_URL`
- Default TTL for cached data: 24 hours

## External Services

### OpenAI / AI Services

- **Purpose**: AI-powered workout plan generation
- **Integration Point**: `src/services/workout-generation.service.ts`
- **Configuration**: 
  - `OPENAI_URL` - OpenAI API endpoint
  - `OPENAI_MODEL` - Fine-tuned model name
  - `OPENAI_API_KEY` - API key for authentication
- **Request Format**: Chat completion with system prompt and user messages

### S3 (Amazon S3)

- **Purpose**: File upload presigned URL generation for profile pictures and workout plan images
- **Integration Point**: `src/config/s3.ts` and `src/controllers/file.controller.ts`
- **Configuration**:
  - `AWS_REGION` - AWS region
  - `AWS_S3_BUCKET_NAME` - S3 bucket name
- **Upload URL Expiry**: 300 seconds (5 minutes)

### Google OAuth

- **Purpose**: Social authentication provider
- **Integration Point**: `src/auth/auth.ts` and Better Auth configuration
- **Configuration**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

## Testing Architecture

### Test Framework

- **Vitest** - Test runner and assertion library
- **Location**: `tests/` directory
- **Configuration**: `vitest.config.ts`

### Test Types

- **Unit Tests** - Test individual functions/services in isolation
- **Integration Tests** - Can test API endpoints when an HTTP test client is introduced; the current suite contains unit and validation tests.

### Test Strategy

- MongoDB and Redis connections are mocked in tests to avoid connecting to production services
- External API calls (OpenAI) are mocked
- Services are tested with mocked dependencies
- Validation schemas are tested with Zod's `safeParse` method

### Running Tests

```bash
npm test           # Run test suite
npm run test:watch  # Run tests in watch mode
```

## API Documentation

See `docs/api.md` for the complete API reference.