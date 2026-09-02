import { Schema, model, type InferSchemaType } from "mongoose";

const nutritionProfileSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    goal: {
      type: String,
      enum: ["maintain", "lose", "gain"],
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    currentWeight: {
      type: Number,
      required: true,
    },
    targetWeight: {
      type: Number,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      required: true,
    },
    bmr: Number,
    tdee: Number,
    calorieTarget: Number,
    macroTarget: {
      macroSplit: {
        type: String,
        enum: ["40-30-30", "50-25-25", "60-20-20"],
        required: true,
      },
      carbs: Number,
      fat: Number,
      protein: Number,
    },
  },
  {
    timestamps: true,
  },
);

export type NutritionProfile = InferSchemaType<typeof nutritionProfileSchema>;

export const NutritionProfileModel = model(
  "NutritionProfile",
  nutritionProfileSchema,
);
