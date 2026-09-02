import { workoutPlanRepository } from "../repositories/workout-plan.repository.js";

import { workoutLogRepository } from "../repositories/workout-log.repository.js";

import { predefinedWorkoutPlanRepository } from "../repositories/predefined-workout-plan.repository.js";

import { workoutGenerationService } from "./workout-generation.service.js";

import { cacheService } from "./cache.service.js";

import { oneRepMaxService } from "./1rm.service.js";

import { parseWorkoutPlan } from "../utils/workout-parser.util.js";

import { buildWorkoutCacheKey } from "../utils/workout-cache-key-util.js";

import { env } from "../config/env.js";

import { AppError } from "../errors/app-error.js";

import type {
  GenerateWorkoutInput,
  WorkoutPlanInput,
  WorkoutSessionInput,
  WorkoutExerciseInput,
  WorkoutAlternateExerciseInput,
} from "../types/workout-plan.types.js";

import type {
  CreateWorkoutLogInput,
  UpdateWorkoutLogInput,
} from "../types/workout-log.types.js";

import type {
  PredefinedWorkoutSessionInput,
  PredefinedWorkoutExerciseInput,
  PredefinedWorkoutAlternateExerciseInput,
} from "../types/predefined-workout-plan.types.js";

class WorkoutService {
  async generateWorkoutPlan(userId: string, data: GenerateWorkoutInput) {
    const existingPlan = await workoutPlanRepository.findByUserId(userId);

    if (existingPlan) {
      throw new AppError(
        "Workout plan already exists. Users cannot generate another plan.",
        409,
      );
    }

    const cacheKey = buildWorkoutCacheKey(
      data.archetype,
      data.trainingDays,
    );
    let workoutPlan = await cacheService.get<WorkoutPlanInput>(cacheKey);

    if (!workoutPlan) {
      const aiResponse = await workoutGenerationService.generate(
        data.archetype,
        data.trainingDays,
      );

      const parsedPlan = parseWorkoutPlan(aiResponse);

      if (parsedPlan.trainingDays !== data.trainingDays) {
        throw new AppError(
          "Generated workout plan does not match the requested training days",
          502,
        );
      }

      workoutPlan = {
        source: "ai",
        planName: parsedPlan.planName,
        programTheme: parsedPlan.programTheme,
        prioritizedMuscles: parsedPlan.prioritizedMuscles,
        neutralPoints: parsedPlan.neutralPoints,
        weakPoints: parsedPlan.weakPoints,
        trainingDays: parsedPlan.trainingDays,
        sessions: parsedPlan.sessions,
      };

      await cacheService.set(cacheKey, workoutPlan, env.REDIS_CACHE_TTL);
    }

    return workoutPlanRepository.create(userId, workoutPlan);
  }

  async assignPredefinedPlan(userId: string, planKey: string) {
    const existingPlan = await workoutPlanRepository.findByUserId(userId);

    if (existingPlan) {
      throw new AppError(
        "Workout plan already exists. Users cannot switch workout plans.",
        409,
      );
    }

    const predefinedPlan =
      await predefinedWorkoutPlanRepository.findByPlanKey(planKey);

    if (!predefinedPlan) {
      throw new AppError("Predefined workout plan not found", 404);
    }

    const workoutPlan: WorkoutPlanInput = {
      source: "predefined",
      planName: predefinedPlan.planName,
      programTheme: predefinedPlan.programTheme,
      prioritizedMuscles: [...predefinedPlan.prioritizedMuscles],
      neutralPoints: [...predefinedPlan.neutralPoints],
      weakPoints: [...predefinedPlan.weakPoints],
      trainingDays: predefinedPlan.trainingDays,
      sessions: this.mapPredefinedSessions(
        predefinedPlan.sessions as PredefinedWorkoutSessionInput[],
      ),
    };

    if (typeof predefinedPlan.imageKey === "string") {
      workoutPlan.imageKey = predefinedPlan.imageKey;
    }

    return workoutPlanRepository.create(userId, workoutPlan);
  }

  private mapPredefinedSessions(
    sessions: PredefinedWorkoutSessionInput[],
  ): WorkoutSessionInput[] {
    return sessions.map((session) => {
      const result: WorkoutSessionInput = {
        sessionOrder: session.sessionOrder,
        focusAreas: [...session.focusAreas],
        exercises: this.mapPredefinedExercises(session.exercises),
      };

      if (typeof session.notes === "string") {
        result.notes = session.notes;
      }

      return result;
    });
  }

  private mapPredefinedExercises(
    exercises: PredefinedWorkoutExerciseInput[],
  ): WorkoutExerciseInput[] {
    return exercises.map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets,
      repRange: exercise.repRange,
      alternates: this.mapPredefinedAlternates(exercise.alternates),
    }));
  }

  private mapPredefinedAlternates(
    alternates: PredefinedWorkoutAlternateExerciseInput[],
  ): WorkoutAlternateExerciseInput[] {
    return alternates.map((alternate) => ({
      name: alternate.name,
      sets: alternate.sets,
      repRange: alternate.repRange,
    }));
  }

  calculateOneRepMax(weight: number, reps: number) {
    return oneRepMaxService.calculate(weight, reps);
  }

  async logWorkout(userId: string, data: CreateWorkoutLogInput) {
    return workoutLogRepository.create(userId, data);
  }

  async getWorkoutLogs(userId: string) {
    return workoutLogRepository.findByUserId(userId);
  }

  async updateWorkoutLog(
    userId: string,
    logId: string,
    data: UpdateWorkoutLogInput,
  ) {
    const log = await workoutLogRepository.updateByIdAndUserId(
      logId,
      userId,
      data,
    );

    if (!log) {
      throw new AppError("Workout log not found", 404);
    }

    return log;
  }

  async getFullWorkoutPlan(userId: string) {
    const plan = await workoutPlanRepository.findByUserId(userId);

    if (!plan) {
      throw new AppError("No workout plan found", 404);
    }

    return plan;
  }

  async getWorkoutSession(userId: string, sessionOrder: number) {
    const plan = await this.getFullWorkoutPlan(userId);

    const session = plan.sessions.find(
      (session) => session.sessionOrder === sessionOrder,
    );

    if (!session) {
      throw new AppError("Session not found in workout plan", 404);
    }

    return session;
  }

  async getPlannedExercises(userId: string, sessionOrder: number) {
    const session = await this.getWorkoutSession(userId, sessionOrder);

    return session.exercises.map(({ name, sets, repRange }) => ({
      name,
      sets,
      repRange,
    }));
  }

  async getMuscleGroupPriorities(userId: string) {
    const plan = await this.getFullWorkoutPlan(userId);

    return {
      prioritizedMuscles: plan.prioritizedMuscles,
      neutralPoints: plan.neutralPoints,
      weakPoints: plan.weakPoints,
    };
  }

  async getWorkoutPlanSummary(userId: string) {
    const plan = await this.getFullWorkoutPlan(userId);

    return {
      planName: plan.planName,
      programTheme: plan.programTheme,
      trainingDays: plan.trainingDays,
      createdAt: plan.createdAt,
    };
  }
}

export const workoutService = new WorkoutService();
