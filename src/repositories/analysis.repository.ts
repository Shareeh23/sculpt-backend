import { WorkoutLogModel } from "../models/workout-log.model.js";

class AnalysisRepository {
  async findExerciseHistory(userId: string, exerciseName: string) {
    return WorkoutLogModel.find({
      userId,
      "exercises.name": exerciseName,
    })
      .sort({
        date: 1,
      })
      .lean();
  }
}

export const analysisRepository = new AnalysisRepository();
