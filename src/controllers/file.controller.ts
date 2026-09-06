import type { Request, Response, NextFunction } from "express";

import { fileService } from "../services/file.service.js";

export const createUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await fileService.createUploadUrl(req.user!.id, req.body);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createDownloadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const url = await fileService.createDownloadUrl(
      req.user!.id,
      req.query.key as string,
    );

    res.status(200).json({
      status: "success",
      data: { url },
    });
  } catch (error) {
    next(error);
  }
};
