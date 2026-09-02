import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodError } from "zod";

import { AppError } from "../errors/app-error.js";
import { WorkoutGenerationError } from "../errors/workout-generation.error.js";
import { logger } from "../config/logger.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void next;

  const requestId = req.headers["x-request-id"] as string ?? crypto.randomUUID();

  const logContext = {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
    userId: req.user?.id,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  };

  if (error instanceof ZodError) {
    logger.warn({ ...logContext, err: error, validationErrors: error.issues }, "Validation failed");
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      requestId,
      errors: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  if (error instanceof WorkoutGenerationError) {
    logger.error({
      ...logContext,
      err: error,
      originalError: error.originalError,
      archetype: error.requestData.archetype,
      trainingDays: error.requestData.trainingDays,
    }, "Workout generation failed");
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      requestId,
    });
  }

  if (error instanceof AppError) {
    logger.warn({ ...logContext, err: error }, "Application error");
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      requestId,
    });
  }

  logger.error({ ...logContext, err: error }, "Internal server error");
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    requestId,
  });
};