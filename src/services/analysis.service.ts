import { analysisRepository } from "../repositories/analysis.repository.js";
import { AppError } from "../errors/app-error.js";

import type {
  ExerciseAnalysis,
  ExerciseHistoryPoint,
  ProgressMetrics,
  TrendAnalysis,
} from "../types/analysis.types.js";

type AnalysisWorkoutLog = {
  date: Date;
  exercises: {
    name: string;
    performedSets: {
      weight: number;
      reps: number;
    }[];
  }[];
};

class AnalysisService {
  async getAnalysis(
    userId: string,
    exerciseName: string,
  ): Promise<ExerciseAnalysis> {
    const normalizedExerciseName = exerciseName.trim();

    if (!normalizedExerciseName) {
      throw new AppError("Exercise name is required", 400);
    }

    const logs = await analysisRepository.findExerciseHistory(
      userId,
      normalizedExerciseName,
    );

    const history = this.buildExerciseHistory(
      logs as AnalysisWorkoutLog[],
      normalizedExerciseName,
    );

    if (history.length === 0) {
      throw new AppError("No data", 404);
    }

    const metrics = this.calculateProgress(history);

    const weightTrend = this.analyzeTrend(history, "weight");

    const volumeTrend = this.analyzeTrend(history, "volume");

    return {
      metrics,
      trends: {
        weight: weightTrend,
        volume: volumeTrend,
      },
      history,
    };
  }

  private buildExerciseHistory(
    logs: AnalysisWorkoutLog[],
    exerciseName: string,
  ): ExerciseHistoryPoint[] {
    const history: ExerciseHistoryPoint[] = [];

    for (const log of logs) {
      const exercise = log.exercises.find((item) => item.name === exerciseName);

      if (!exercise || exercise.performedSets.length === 0) {
        continue;
      }

      const weight = Math.max(
        ...exercise.performedSets.map((set) => set.weight),
      );

      const volume = exercise.performedSets.reduce(
        (total, set) => total + set.weight * set.reps,
        0,
      );

      const reps = exercise.performedSets.reduce(
        (total, set) => total + set.reps,
        0,
      );

      history.push({
        date: log.date,
        weight,
        volume,
        reps,
      });
    }

    return history;
  }

  private calculateProgress(
    history: ExerciseHistoryPoint[],
  ): ProgressMetrics | null {
    if (history.length < 2) {
      return null;
    }

    const first = history.at(0);
    const latest = history.at(-1);

    if (!first || !latest) {
      return null;
    }

    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;

    const weeks =
      (latest.date.getTime() - first.date.getTime()) / millisecondsPerWeek;

    const effectiveWeeks = weeks > 0 ? weeks : 1;

    return {
      weight: {
        current: latest.weight,
        change: latest.weight - first.weight,
        weeklyChange: (latest.weight - first.weight) / effectiveWeeks,
      },
      volume: {
        current: latest.volume,
        change: latest.volume - first.volume,
        weeklyChange: (latest.volume - first.volume) / effectiveWeeks,
      },
    };
  }

  private analyzeTrend(
    history: ExerciseHistoryPoint[],
    metric: "weight" | "volume",
  ): TrendAnalysis | "insufficient data" {
    if (history.length < 3) {
      return "insufficient data";
    }

    const points = history.map((item, index) => ({
      x: index,
      y: item[metric],
    }));

    const n = points.length;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumX2 += point.x * point.x;
    }

    const denominator = n * sumX2 - sumX * sumX;

    if (denominator === 0) {
      return {
        slope: 0,
        rSquared: 0,
        confidence: "low",
        isVolatile: false,
        direction: "stable",
      };
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;

    const intercept = (sumY - slope * sumX) / n;

    const yMean = sumY / n;

    let ssTot = 0;
    let ssRes = 0;

    const residuals: number[] = [];

    for (const point of points) {
      const predicted = slope * point.x + intercept;

      const residual = point.y - predicted;

      ssTot += Math.pow(point.y - yMean, 2);

      ssRes += Math.pow(residual, 2);

      residuals.push(residual);
    }

    const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

    let confidence: "low" | "medium" | "high" = "low";

    if (Math.abs(slope) > 0.1) {
      if (rSquared > 0.5) {
        confidence = "high";
      } else if (rSquared > 0.3) {
        confidence = "medium";
      }
    }

    const residualVariance =
      residuals.reduce((sum, residual) => sum + residual * residual, 0) / n;

    const residualStdDev = Math.sqrt(residualVariance);

    const isVolatile = yMean !== 0 && residualStdDev > Math.abs(yMean) * 0.1;

    let direction: "stable" | "up" | "down";

    if (Math.abs(slope) < 0.01) {
      direction = "stable";
    } else if (slope > 0) {
      direction = "up";
    } else {
      direction = "down";
    }

    return {
      slope,
      rSquared,
      confidence,
      isVolatile,
      direction,
    };
  }
}

export const analysisService = new AnalysisService();
