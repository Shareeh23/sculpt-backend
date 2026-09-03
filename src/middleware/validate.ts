import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

import { logger } from "../config/logger.js";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      // Express leaves req.body undefined for body-less requests such as GET.
      // Schemas for those routes correctly expect an empty object instead.
      body: req.body ?? {},
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      logger.error({ errors: result.error.issues }, "Validation errors");

      return res.status(422).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    // Use the parsed payload so Zod defaults and transformations reach the
    // controller instead of merely being used as a validation check.
    req.body = (result.data as { body: unknown }).body;

    next();
  };
};