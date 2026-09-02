import { nutritionRepository } from "../repositories/nutrition.repository.js";

import { calorieCalculatorService } from "./calorie-calculator.service.js";

import { macroCalculatorService } from "./macro-calculator.service.js";

import type { NutritionInput, MacroSplit } from "../types/nutrition.types.js";

import { AppError } from "../errors/app-error.js";

class NutritionService {
  async getNutritionProfile(userId: string) {
    const profile = await nutritionRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError("Nutrition profile not found", 404);
    }

    return profile;
  }

  async createNutritionProfile(userId: string, data: NutritionInput) {
    const existingProfile = await nutritionRepository.findByUserId(userId);

    if (existingProfile) {
      throw new AppError("Nutrition profile already exists", 409);
    }

    const metrics = this.calculateNutritionMetrics(data);

    return nutritionRepository.create({
      userId,
      height: data.height,
      currentWeight: data.weight,
      age: data.age,
      gender: data.gender,
      activityLevel: data.activityLevel,
      goal: data.goal,
      ...metrics,
    });
  }

  async updateNutritionProfile(userId: string, data: NutritionInput) {
    const existingProfile = await nutritionRepository.findByUserId(userId);

    if (!existingProfile) {
      throw new AppError("Nutrition profile not found. Create one first.", 404);
    }

    const metrics = this.calculateNutritionMetrics(data);

    return nutritionRepository.updateByUserId(userId, {
      height: data.height,
      currentWeight: data.weight,
      age: data.age,
      gender: data.gender,
      activityLevel: data.activityLevel,
      goal: data.goal,
      ...metrics,
    });
  }

  calculateMacros(calories: number, split: MacroSplit) {
    return macroCalculatorService.calculateMacros(calories, split);
  }

  private calculateNutritionMetrics(data: NutritionInput) {
    const bmr = calorieCalculatorService.calculateBMR(
      data.gender,
      data.weight,
      data.height,
      data.age,
    );

    const tdee = calorieCalculatorService.calculateTDEE(
      data.gender,
      data.weight,
      data.height,
      data.age,
      data.activityLevel,
    );

    const calorieTarget = calorieCalculatorService.calculateDailyCalories(
      data.gender,
      data.weight,
      data.height,
      data.age,
      data.activityLevel,
      data.goal,
    );

    const macros = macroCalculatorService.calculateMacros(
      calorieTarget,
      data.macroSplit,
    );

    return {
      bmr,
      tdee,
      calorieTarget,
      macroTarget: {
        ...macros,
        macroSplit: data.macroSplit,
      },
    };
  }
}

export const nutritionService = new NutritionService();
