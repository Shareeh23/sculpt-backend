import { Router } from "express";

import {
  getPredefinedPlans,
  getPredefinedPlanByKey,
} from "../controllers/predefined-workout-plan.controller.js";

import { validate } from "../middleware/validate.js";

import { apiRateLimit } from "../middleware/rate-limit.js";

import { getPredefinedPlanByKeySchema } from "../schemas/predefined-workout-plan.schema.js";

const predefinedWorkoutPlanRouter = Router();

predefinedWorkoutPlanRouter.use(apiRateLimit);

predefinedWorkoutPlanRouter.get("/", getPredefinedPlans);

predefinedWorkoutPlanRouter.get(
  "/:planKey",
  validate(getPredefinedPlanByKeySchema),
  getPredefinedPlanByKey,
);

export default predefinedWorkoutPlanRouter;
