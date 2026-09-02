export type NutritionGender = "male" | "female" | "other";

export type NutritionActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type NutritionGoal = "maintain" | "lose" | "gain";

export type MacroSplit = "40-30-30" | "50-25-25" | "60-20-20";

export type NutritionInput = {
  height: number;
  weight: number;
  age: number;
  gender: NutritionGender;
  activityLevel: NutritionActivityLevel;
  goal: NutritionGoal;
  macroSplit: MacroSplit;
};
