import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { predefinedWorkoutPlanService } from "./predefined-workout-plan.service.js";

import { logger } from "../config/logger.js";
import type { PredefinedWorkoutPlanInput } from "../types/predefined-workout-plan.types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PREDEFINED_PLANS_FILE = path.resolve(
  __dirname,
  "../../predefined-workout-plans.json",
);

type RawPredefinedPlan = {
  source: string;
  planName: string;
  programTheme: string;
  imageKey?: string;
  prioritizedMuscles: string[];
  neutralPoints: string[];
  weakPoints: string[];
  trainingDays: number;
  sessions: unknown[];
};

function generatePlanKey(planName: string): string {
  return planName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function transformToPlanInput(
  raw: RawPredefinedPlan,
): PredefinedWorkoutPlanInput {
  return {
    planKey: generatePlanKey(raw.planName),
    planName: raw.planName,
    programTheme: raw.programTheme,
    prioritizedMuscles: raw.prioritizedMuscles,
    neutralPoints: raw.neutralPoints,
    weakPoints: raw.weakPoints,
    trainingDays: raw.trainingDays,
    sessions: raw.sessions as PredefinedWorkoutPlanInput["sessions"],
  };
}

export async function seedPredefinedWorkoutPlans(): Promise<void> {
  try {
    if (!fs.existsSync(PREDEFINED_PLANS_FILE)) {
      logger.warn({ file: PREDEFINED_PLANS_FILE }, "Predefined workout plans file not found");

      return;
    }

    const fileContent = fs.readFileSync(PREDEFINED_PLANS_FILE, "utf-8");

    const rawPlans = JSON.parse(fileContent) as RawPredefinedPlan[];

    const plansToSeed = rawPlans
      .filter((plan) => plan.source === "predefined")
      .map(transformToPlanInput);

    if (plansToSeed.length === 0) {
      logger.info("No predefined workout plans to seed");

      return;
    }

    await predefinedWorkoutPlanService.seedPredefinedPlans(plansToSeed);

    logger.info({ count: plansToSeed.length }, "Predefined workout plans seeded");
  } catch (error) {
    logger.error({ err: error }, "Failed to seed predefined workout plans");

    throw error;
  }
}
