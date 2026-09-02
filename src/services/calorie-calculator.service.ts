import type {
  NutritionGender,
  NutritionActivityLevel,
  NutritionGoal,
} from "../types/nutrition.types.js";

const ACTIVITY_MULTIPLIERS: Record<NutritionActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<NutritionGoal, number> = {
  maintain: 0,
  lose: -500,
  gain: 300,
};

class CalorieCalculatorService {
  calculateBMR(
    gender: NutritionGender,
    weight: number,
    height: number,
    age: number,
  ): number {
    /*
     * Mifflin-St Jeor equation.
     *
     * Male:
     *   BMR = 10W + 6.25H - 5A + 5
     *
     * Female:
     *   BMR = 10W + 6.25H - 5A - 161
     *
     * For "other", we use the average constant.
     */

    const base = 10 * weight + 6.25 * height - 5 * age;

    if (gender === "male") {
      return Math.round(base + 5);
    }

    if (gender === "female") {
      return Math.round(base - 161);
    }

    return Math.round(base - 78);
  }

  calculateTDEE(
    gender: NutritionGender,
    weight: number,
    height: number,
    age: number,
    activityLevel: NutritionActivityLevel,
  ): number {
    const bmr = this.calculateBMR(gender, weight, height, age);

    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
  }

  calculateDailyCalories(
    gender: NutritionGender,
    weight: number,
    height: number,
    age: number,
    activityLevel: NutritionActivityLevel,
    goal: NutritionGoal = "maintain",
  ): number {
    const tdee = this.calculateTDEE(gender, weight, height, age, activityLevel);

    return Math.max(1200, Math.round(tdee + GOAL_ADJUSTMENTS[goal]));
  }
}

export const calorieCalculatorService = new CalorieCalculatorService();
