import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { env } from "./config/env.js";
import { auth } from "./auth/auth.js";
import workoutRouter from "./routes/workout.route.js";
import nutritionRouter from "./routes/nutrition.route.js";
import analysisRouter from "./routes/analysis.route.js";
import fileRouter from "./routes/file.route.js";
import predefinedWorkoutPlanRouter from "./routes/predefined-workout-plan.route.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { httpLogger } from "./middleware/http-logger.js";
import { authRateLimit } from "./middleware/rate-limit.js";

const app = express();

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: [
      "Content-Disposition",
      "Retry-After",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "X-Request-ID",
    ],
  })
);

// Request ID
app.use(requestId);

// HTTP request logging
app.use(httpLogger);

// Better Auth
// Must come before express.json()
app.all("/api/v1/auth/*splat", authRateLimit, toNodeHandler(auth));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Application routes
app.use("/api/v1/workout", workoutRouter);
app.use("/api/v1/nutrition", nutritionRouter);
app.use("/api/v1/analysis", analysisRouter);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/predefined-plans", predefinedWorkoutPlanRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;