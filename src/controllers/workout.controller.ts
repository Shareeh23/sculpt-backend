import type { Request, Response, NextFunction } from "express";

import { workoutService } from "../services/workout.service.js";

export const generateWorkoutPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workoutPlan = await workoutService.generateWorkoutPlan(
      req.user!.id,
      req.body,
    );

    res.status(201).json({
      status: "success",
      data: workoutPlan,
    });
  } catch (error) {
    next(error);
  }
};

export const assignPredefinedPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const planKey = req.params.planKey as string;

    if (!planKey) {
      return res.status(400).json({
        status: "error",
        message: "Plan ID is required",
      });
    }

    const workoutPlan = await workoutService.assignPredefinedPlan(
      req.user!.id,
      planKey,
    );

    res.status(201).json({
      status: "success",
      message: "Workout plan assigned successfully",
      data: workoutPlan,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateOneRepMax = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = workoutService.calculateOneRepMax(
      Number(req.body.weight),
      Number(req.body.reps),
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workoutLog = await workoutService.logWorkout(req.user!.id, req.body);

    res.status(201).json({
      status: "success",
      message: "Workout logged successfully",
      data: workoutLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const logs = await workoutService.getWorkoutLogs(req.user!.id);

    res.status(200).json({
      status: "success",
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const logId = req.params.logId as string;

    if (!logId) {
      return res.status(400).json({
        status: "error",
        message: "Workout log ID is required",
      });
    }

    const log = await workoutService.updateWorkoutLog(
      req.user!.id,
      logId,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const getFullWorkoutPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plan = await workoutService.getFullWorkoutPlan(req.user!.id);

    res.status(200).json({
      status: "success",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionOrder = Number(req.params.sessionOrder);

    if (!Number.isInteger(sessionOrder)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid session order",
      });
    }

    const session = await workoutService.getWorkoutSession(
      req.user!.id,
      sessionOrder,
    );

    res.status(200).json({
      status: "success",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlannedExercises = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionOrder = Number(req.params.sessionOrder);

    if (!Number.isInteger(sessionOrder)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid session order",
      });
    }

    const exercises = await workoutService.getPlannedExercises(
      req.user!.id,
      sessionOrder,
    );

    res.status(200).json({
      status: "success",
      data: exercises,
    });
  } catch (error) {
    next(error);
  }
};

export const getMuscleGroupPriorities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const priorities = await workoutService.getMuscleGroupPriorities(
      req.user!.id,
    );

    res.status(200).json({
      status: "success",
      data: priorities,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutPlanSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const summary = await workoutService.getWorkoutPlanSummary(req.user!.id);

    res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
