import { Router } from "express";

import {
  generateWorkoutPlan,
  assignPredefinedPlan,
  calculateOneRepMax,
  logWorkout,
  getLogs,
  updateLog,
  getFullWorkoutPlan,
  getWorkoutSession,
  getPlannedExercises,
  getMuscleGroupPriorities,
  getWorkoutPlanSummary,
} from "../controllers/workout.controller.js";

import { requireAuth } from "../middleware/require-auth.js";

import { validate } from "../middleware/validate.js";

import {
  aiGenerationRateLimit,
  apiRateLimit,
} from "../middleware/rate-limit.js";

import {
  generateWorkoutSchema,
  calculateOneRepMaxSchema,
  assignPredefinedPlanSchema,
  createWorkoutLogSchema,
  updateWorkoutLogSchema,
  getWorkoutSessionSchema,
  getPlannedExercisesSchema,
} from "../schemas/workout.schema.js";

const workoutRouter = Router();

workoutRouter.use(requireAuth);

workoutRouter.use(apiRateLimit);

workoutRouter.get("/plan", getFullWorkoutPlan);

workoutRouter.get("/plan/summary", getWorkoutPlanSummary);

workoutRouter.get(
  "/plan/session/:sessionOrder",
  validate(getWorkoutSessionSchema),
  getWorkoutSession,
);

workoutRouter.get(
  "/plan/session/:sessionOrder/exercises",
  validate(getPlannedExercisesSchema),
  getPlannedExercises,
);

workoutRouter.get("/plan/muscles", getMuscleGroupPriorities);

workoutRouter.post(
  "/generate",
  aiGenerationRateLimit,
  validate(generateWorkoutSchema),
  generateWorkoutPlan,
);

workoutRouter.post(
  "/calculate/1rm",
  validate(calculateOneRepMaxSchema),
  calculateOneRepMax,
);

workoutRouter.post(
  "/predefined/:planKey/assign",
  validate(assignPredefinedPlanSchema),
  assignPredefinedPlan,
);

workoutRouter.get("/logs", getLogs);

workoutRouter.post("/logs", validate(createWorkoutLogSchema), logWorkout);

workoutRouter.put("/logs/:logId", validate(updateWorkoutLogSchema), updateLog);

export default workoutRouter;
