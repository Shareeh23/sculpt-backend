import { predefinedWorkoutPlanRepository } from "../repositories/predefined-workout-plan.repository.js";

import { AppError } from "../errors/app-error.js";

import type { PredefinedWorkoutPlanInput } from "../types/predefined-workout-plan.types.js";

class PredefinedWorkoutPlanService {
  async getAllPlans() {
    const plans = await predefinedWorkoutPlanRepository.findAll();

    return plans.map((plan) => this.toPlanInput(plan));
  }

  async getPlanByPlanKey(planKey: string) {
    const plan =
      await predefinedWorkoutPlanRepository.findByPlanKey(planKey);

    if (!plan) {
      throw new AppError(
        "Predefined workout plan not found",
        404,
      );
    }

    return this.toPlanInput(plan);
  }

  async createPlan(data: PredefinedWorkoutPlanInput) {
    const plan =
      await predefinedWorkoutPlanRepository.create(data);

    return this.toPlanInput(plan.toObject());
  }

  async updatePlan(
    planKey: string,
    data: Partial<PredefinedWorkoutPlanInput>,
  ) {
    const plan =
      await predefinedWorkoutPlanRepository.updateByPlanKey(
        planKey,
        data,
      );

    if (!plan) {
      throw new AppError(
        "Predefined workout plan not found",
        404,
      );
    }

    return this.toPlanInput(plan);
  }

  async deletePlan(planKey: string) {
    const plan =
      await predefinedWorkoutPlanRepository.deleteByPlanKey(
        planKey,
      );

    if (!plan) {
      throw new AppError(
        "Predefined workout plan not found",
        404,
      );
    }

    return true;
  }

  async seedPredefinedPlans(
    plans: PredefinedWorkoutPlanInput[],
  ) {
    const results = [];

    for (const plan of plans) {
      const result =
        await predefinedWorkoutPlanRepository.upsertByPlanKey(
          plan.planKey,
          plan,
        );

      results.push(result);
    }

    return results;
  }

  private toPlanInput(plan: {
    planKey: string;
    planName: string;
    programTheme: string;
    imageKey?: string | null;
    prioritizedMuscles: string[];
    neutralPoints: string[];
    weakPoints: string[];
    trainingDays: number;
    sessions: Array<{
      sessionOrder: number;
      focusAreas: string[];
      exercises: Array<{
        name: string;
        sets: number;
        repRange: string;
        alternates: Array<{
          name: string;
          sets: number;
          repRange: string;
        }>;
      }>;
      notes?: string | null;
    }>;
  }): PredefinedWorkoutPlanInput {
    const result: PredefinedWorkoutPlanInput = {
      planKey: plan.planKey,
      planName: plan.planName,
      programTheme: plan.programTheme,
      prioritizedMuscles: [...plan.prioritizedMuscles],
      neutralPoints: [...plan.neutralPoints],
      weakPoints: [...plan.weakPoints],
      trainingDays: plan.trainingDays,

      sessions: plan.sessions.map((session) => {
        const mappedSession = {
          sessionOrder: session.sessionOrder,
          focusAreas: [...session.focusAreas],

          exercises: session.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            repRange: exercise.repRange,

            alternates: exercise.alternates.map((alternate) => ({
              name: alternate.name,
              sets: alternate.sets,
              repRange: alternate.repRange,
            })),
          })),
        };

        if (typeof session.notes === "string") {
          return {
            ...mappedSession,
            notes: session.notes,
          };
        }

        return mappedSession;
      }),
    };

    if (typeof plan.imageKey === "string") {
      result.imageKey = plan.imageKey;
    }

    return result;
  }
}

export const predefinedWorkoutPlanService =
  new PredefinedWorkoutPlanService();