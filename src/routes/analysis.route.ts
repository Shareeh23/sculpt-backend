import { Router } from "express";

import { z } from "zod";

import { requireAuth } from "../middleware/require-auth.js";

import { validate } from "../middleware/validate.js";

import { apiRateLimit } from "../middleware/rate-limit.js";

import { getAnalysis } from "../controllers/analysis.controller.js";

const analysisRouter = Router();

analysisRouter.use(requireAuth);

analysisRouter.use(apiRateLimit);

const exerciseParamSchema = z.object({
  params: z.object({
    exercise: z.string().trim().min(1, "Exercise name is required").max(100),
  }),
  query: z.object({}),
  body: z.object({}),
});

analysisRouter.get("/:exercise", validate(exerciseParamSchema), getAnalysis);

export default analysisRouter;
