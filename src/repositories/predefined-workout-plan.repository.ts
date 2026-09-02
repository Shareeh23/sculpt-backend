import { PredefinedWorkoutPlanModel } from "../models/predefined-workout-plan.model.js";

import type { PredefinedWorkoutPlanInput } from "../types/predefined-workout-plan.types.js";

class PredefinedWorkoutPlanRepository {
  async create(data: PredefinedWorkoutPlanInput) {
    return PredefinedWorkoutPlanModel.create(data);
  }

  async findById(id: string) {
    return PredefinedWorkoutPlanModel.findById(id).lean();
  }

  async findByPlanKey(planKey: string) {
    return PredefinedWorkoutPlanModel.findOne({ planKey }).lean();
  }

  async findAll() {
    return PredefinedWorkoutPlanModel.find({})
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async updateByPlanKey(
    planKey: string,
    data: Partial<PredefinedWorkoutPlanInput>,
  ) {
    return PredefinedWorkoutPlanModel.findOneAndUpdate(
      { planKey },
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();
  }

  async deleteByPlanKey(planKey: string) {
    return PredefinedWorkoutPlanModel.findOneAndDelete({
      planKey,
    }).lean();
  }

  async upsertByPlanKey(planKey: string, data: PredefinedWorkoutPlanInput) {
    return PredefinedWorkoutPlanModel.findOneAndUpdate(
      { planKey },
      { $setOnInsert: data },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();
  }
}

export const predefinedWorkoutPlanRepository =
  new PredefinedWorkoutPlanRepository();
