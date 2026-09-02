import type { Request, Response, NextFunction } from "express";

import { nutritionService } from "../services/nutrition.service.js";

export const getNutritionProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const profile = await nutritionService.getNutritionProfile(userId);

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const createNutritionProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const profile = await nutritionService.createNutritionProfile(
      userId,
      req.body,
    );

    res.status(201).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNutritionProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const profile = await nutritionService.updateNutritionProfile(
      userId,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateMacros = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { calories, split } = req.body;

    const macros = nutritionService.calculateMacros(calories, split);

    res.status(200).json({
      status: "success",
      data: macros,
    });
  } catch (error) {
    next(error);
  }
};
