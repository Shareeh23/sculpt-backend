import { Router } from "express";

import { createUploadUrl } from "../controllers/file.controller.js";

import { requireAuth } from "../middleware/require-auth.js";

import { validate } from "../middleware/validate.js";

import { fileUploadRateLimit, apiRateLimit } from "../middleware/rate-limit.js";

import { createUploadUrlSchema } from "../schemas/file.schema.js";

const fileRouter = Router();

fileRouter.use(requireAuth);

fileRouter.use(apiRateLimit);

fileRouter.post(
  "/upload-url",
  fileUploadRateLimit,
  validate(createUploadUrlSchema),
  createUploadUrl,
);

export default fileRouter;
