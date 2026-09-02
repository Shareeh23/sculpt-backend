import { WorkoutLogModel } from "../models/workout-log.model.js";
import type {
  CreateWorkoutLogInput,
  UpdateWorkoutLogInput,
} from "../types/workout-log.types.js";

class WorkoutLogRepository {
  async create(userId: string, data: CreateWorkoutLogInput) {
    return WorkoutLogModel.create({
      userId,
      sessionOrder: data.sessionOrder,
      exercises: data.exercises,
    });
  }

  async findByUserId(userId: string) {
    return WorkoutLogModel.find({
      userId,
    }).sort({
      date: 1,
    });
  }

  async findByIdAndUserId(logId: string, userId: string) {
    return WorkoutLogModel.findOne({
      _id: logId,
      userId,
    });
  }

  async updateByIdAndUserId(
    logId: string,
    userId: string,
    data: UpdateWorkoutLogInput,
  ) {
    return WorkoutLogModel.findOneAndUpdate(
      {
        _id: logId,
        userId,
      },
      {
        $set: data,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  }
}

export const workoutLogRepository = new WorkoutLogRepository();
