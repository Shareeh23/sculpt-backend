import type { Request, Response, NextFunction } from "express";

import { auth } from "../auth/auth.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    req.user = session.user;

    next();
  } catch (error) {
    next(error);
  }
};