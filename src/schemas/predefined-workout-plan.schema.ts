import { z } from "zod";

export const getPredefinedPlanByKeySchema = z.object({
  body: z.object({}),

  params: z.object({
    planKey: z.string().trim().min(1, "Plan key is required"),
  }),

  query: z.object({}),
});

export const getPredefinedPlanByIdSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: z.string().min(1, "Plan ID is required"),
  }),

  query: z.object({}),
});
