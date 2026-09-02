import { z } from "zod";

const fileCategorySchema = z.enum(["profile-picture", "workout-plan"]);

const imageContentTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const createUploadUrlSchema = z.object({
  body: z.object({
    category: fileCategorySchema,

    fileName: z
      .string()
      .trim()
      .min(1, "File name is required")
      .max(255, "File name cannot exceed 255 characters"),

    contentType: imageContentTypeSchema,
  }),

  params: z.object({}),

  query: z.object({}),
});
