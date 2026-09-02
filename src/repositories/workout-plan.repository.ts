import { WorkoutPlanModel } from "../models/workout-plan.model.js";

import type { WorkoutPlanInput } from "../types/workout-plan.types.js";

class WorkoutPlanRepository {
  async create(userId: string, data: WorkoutPlanInput) {
    return WorkoutPlanModel.create({
      userId,
      ...data,
    });
  }

  async findById(id: string) {
    return WorkoutPlanModel.findById(id);
  }

  async findByUserId(userId: string) {
    return WorkoutPlanModel.findOne({
      userId,
    });
  }

  async existsByUserId(userId: string) {
    return WorkoutPlanModel.exists({
      userId,
    });
  }
}

export const workoutPlanRepository = new WorkoutPlanRepository();
