import { Router } from "express";

import { requireAuth } from "../middleware/require-auth.js";

import { validate } from "../middleware/validate.js";

import { apiRateLimit } from "../middleware/rate-limit.js";

import {
  getNutritionProfile,
  createNutritionProfile,
  updateNutritionProfile,
  calculateMacros,
} from "../controllers/nutrition.controller.js";

import {
  createNutritionProfileSchema,
  updateNutritionProfileSchema,
  calculateMacrosSchema,
} from "../schemas/nutrition.schema.js";

const nutritionRouter = Router();

nutritionRouter.use(requireAuth);

nutritionRouter.use(apiRateLimit);

nutritionRouter.get("/get-profile", getNutritionProfile);

nutritionRouter.post(
  "/create-profile",
  validate(createNutritionProfileSchema),
  createNutritionProfile,
);

nutritionRouter.patch(
  "/update-profile",
  validate(updateNutritionProfileSchema),
  updateNutritionProfile,
);

nutritionRouter.post(
  "/calculate-macros",
  validate(calculateMacrosSchema),
  calculateMacros,
);

export default nutritionRouter;
