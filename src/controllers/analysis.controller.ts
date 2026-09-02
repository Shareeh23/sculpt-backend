import type { Request, Response, NextFunction } from "express";

import { analysisService } from "../services/analysis.service.js";

export const getAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const exerciseName = req.params.exercise as string;

    const analysis = await analysisService.getAnalysis(
      req.user!.id,
      exerciseName,
    );

    res.status(200).json({
      status: "success",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
