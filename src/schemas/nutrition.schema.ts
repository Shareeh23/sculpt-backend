import { z } from "zod";

const goalSchema = z.enum(["maintain", "lose", "gain"]);

const genderSchema = z.enum(["male", "female", "other"]);

const activityLevelSchema = z.enum([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);

const macroSplitSchema = z.enum(["40-30-30", "50-25-25", "60-20-20"]);

export const createNutritionProfileSchema = z.object({
  body: z.object({
    height: z.number().min(120).max(230),

    weight: z.number().min(40).max(250),

    age: z.number().int().min(18).max(80),

    gender: genderSchema,

    activityLevel: activityLevelSchema,

    goal: goalSchema.default("maintain"),

    macroSplit: macroSplitSchema.default("40-30-30"),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const updateNutritionProfileSchema = z.object({
  body: z.object({
    height: z.number().min(120).max(230),

    weight: z.number().min(40).max(250),

    age: z.number().int().min(18).max(80),

    gender: genderSchema,

    activityLevel: activityLevelSchema,

    goal: goalSchema.default("maintain"),

    macroSplit: macroSplitSchema.default("40-30-30"),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const calculateMacrosSchema = z.object({
  body: z.object({
    calories: z.number().int().min(1000).max(10000),

    split: macroSplitSchema.default("40-30-30"),
  }),

  params: z.object({}),

  query: z.object({}),
});
