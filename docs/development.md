# Development Guide

## Prerequisites

- **Node.js** - LTS version recommended
- **npm** - Comes with Node.js
- **MongoDB** - Running instance (local or cloud)
- **Redis** - Running instance (local or cloud)
- **OpenAI API Key** - For AI workout generation
- **Git** - For version control (optional)

## Installation

```bash
git clone <repository-url>
cd sculpt-backend
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
MONGO_DB_URL=mongodb://localhost:27017/sculpt
MONGO_DB_NAME=sculpt
REDIS_URL=redis://localhost:6379
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

## Running Locally

### Development Mode

```bash
npm run dev
```

This starts the server with Node's built-in watch mode and the `tsx` TypeScript loader.

### Production Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Production Start

```bash
npm start
```

This starts the compiled application from `dist/server.js`.

## MongoDB

### Local Development

For local development, you can run MongoDB locally:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
```

Set `MONGO_DB_URL` in `.env` to your MongoDB connection string.

## Redis

### Local Development

For local development, you can run Redis locally:

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or install Redis locally
```

Set `REDIS_URL` in `.env` to your Redis connection string. Redis caches reusable AI workout-plan templates by normalized character archetype and training-day count; configure their lifetime with `REDIS_CACHE_TTL` (default: 86400 seconds).

## Testing

```bash
npm test
```

Run test suite once.

```bash
npm run test:watch
```

Run tests in watch mode for development.

### Running Specific Tests

```bash
npm test -- tests/one-rep-max/one-rep-max.test.ts
```

## Type Checking

```bash
npx tsc --noEmit
```

Type check without emitting files.

## Linting

```bash
npm run lint
```

Run ESLint on source files.

```bash
npm run lint:fix
```

Auto-fix linting issues.

## Docker

### Build Image

```bash
docker build -t sculpt-backend .
```

### Run Container

```bash
docker run --env-file .env -p 3000:3000 sculpt-backend
```

### Verify Container

```bash
curl http://localhost:3000/health
```

### Stop Container

```bash
docker stop $(docker ps -q --filter ancestor=sculpt-backend)
```

## Development Conventions

### Project Organization

The codebase follows a layered architecture:

- `src/routes/` - Express route definitions
- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/repositories/` - Data access layer
- `src/models/` - Mongoose models
- `src/schemas/` - Zod validation schemas
- `src/middleware/` - Express middleware
- `src/types/` - TypeScript type definitions

### TypeScript Conventions

- Use ES modules (`import/export`)
- Explicit types for function parameters and return types
- Strict mode enabled in tsconfig.json
- Use relative project imports with `.js` extensions

### Validation

- All request bodies are validated using Zod schemas
- Validation schemas are defined in `src/schemas/`
- Use the `validate` middleware to apply schemas

### Error Handling

- Use the `AppError` class for application errors
- Throw errors from services; catch in controllers
- Middleware handles error formatting and response

### Testing Conventions

- Test files are in the `tests/` directory
- Use `vitest` as the test runner
- Mock external dependencies (MongoDB, Redis, OpenAI)
- Test business logic in isolation

## Common Tasks

### Adding a New Route

1. Define the route in `src/routes/`
2. Create or update the controller in `src/controllers/`
3. Create or update the service in `src/services/`
4. Add validation schema if needed in `src/schemas/`
5. Add tests in `tests/`

### Adding Validation

1. Define a Zod schema in `src/schemas/`
2. Apply the schema using the `validate` middleware in the route

## Troubleshooting

- **Port already in use**: Stop any process using port 3000 or change PORT in `.env`
- **MongoDB connection failed**: Verify `MONGO_DB_URL` is correct
- **Redis connection failed**: Verify `REDIS_URL` is correct
- **Authentication issues**: Verify `BETTER_AUTH_URL` matches your server URL
- **OpenAI errors**: Check `OPENAI_API_KEY` is valid

## Useful Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Audit dependencies
npm audit
```