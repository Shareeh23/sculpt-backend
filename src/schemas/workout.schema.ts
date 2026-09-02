import { z } from "zod";

export const generateWorkoutSchema = z.object({
  body: z.object({
    archetype: z
      .string()
      .trim()
      .min(1, "Character archetype is required")
      .max(50, "Archetype cannot exceed 50 characters"),

    trainingDays: z
      .number()
      .int("Training days must be an integer")
      .min(3, "Must specify at least 3 training days")
      .max(6, "Must specify no more than 6 training days"),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const calculateOneRepMaxSchema = z.object({
  body: z.object({
    weight: z
      .number()
      .min(20, "Weight must be at least 20")
      .max(500, "Weight cannot exceed 500"),

    reps: z
      .number()
      .int("Reps must be an integer")
      .min(1, "Reps must be at least 1")
      .max(10, "Reps cannot exceed 10"),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const assignPredefinedPlanSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({
    planKey: z.string().min(1, "Plan ID is required"),
  }),
  query: z.object({}),
});

export const createWorkoutLogSchema = z.object({
  body: z.object({
    sessionOrder: z
      .number()
      .int()
      .min(1, "Session order must be at least 1"),

    exercises: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(1, "Exercise name is required"),

          performedSets: z
            .array(
              z.object({
                weight: z
                  .number()
                  .min(0, "Weight cannot be negative"),

                reps: z
                  .number()
                  .int()
                  .min(1, "Reps must be at least 1"),
              }),
            )
            .min(1, "At least one set is required"),
        }),
      )
      .min(1, "At least one exercise is required"),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const updateWorkoutLogSchema = z.object({
  body: z.object({
    sessionOrder: z
      .number()
      .int()
      .min(1)
      .optional(),

    exercises: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(1),

          performedSets: z
            .array(
              z.object({
                weight: z.number().min(0),

                reps: z
                  .number()
                  .int()
                  .min(1),
              }),
            )
            .min(1),
        }),
      )
      .min(1)
      .optional(),
  }),

  params: z.object({
    logId: z.string().min(1, "Log ID is required"),
  }),

  query: z.object({}),
});

export const getWorkoutSessionSchema = z.object({
  body: z.object({}),

  params: z.object({
    sessionOrder: z.coerce
      .number()
      .int()
      .min(1, "Session order must be at least 1"),
  }),

  query: z.object({}),
});

export const getPlannedExercisesSchema = z.object({
  body: z.object({}),

  params: z.object({
    sessionOrder: z.coerce
      .number()
      .int()
      .min(1, "Session order must be at least 1"),
  }),

  query: z.object({}),
});