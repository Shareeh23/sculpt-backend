import type { Request, Response, NextFunction } from "express";

import { predefinedWorkoutPlanService } from "../services/predefined-workout-plan.service.js";

export const getPredefinedPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plans = await predefinedWorkoutPlanService.getAllPlans();

    res.status(200).json({
      status: "success",
      results: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

export const getPredefinedPlanByKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const planKey = req.params.planKey as string;

    const plan =
      await predefinedWorkoutPlanService.getPlanByPlanKey(planKey);

    res.status(200).json({
      status: "success",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};