export type ExerciseHistoryPoint = {
  date: Date;
  weight: number;
  volume: number;
  reps: number;
};

export type ProgressMetrics = {
  weight: {
    current: number;
    change: number;
    weeklyChange: number;
  };
  volume: {
    current: number;
    change: number;
    weeklyChange: number;
  };
};

export type TrendDirection = "stable" | "up" | "down";

export type TrendConfidence = "low" | "medium" | "high";

export type TrendAnalysis = {
  slope: number;
  rSquared: number;
  confidence: TrendConfidence;
  isVolatile: boolean;
  direction: TrendDirection;
};

export type ExerciseAnalysis = {
  metrics: ProgressMetrics | null;
  trends: {
    weight: TrendAnalysis | "insufficient data";
    volume: TrendAnalysis | "insufficient data";
  };
  history: ExerciseHistoryPoint[];
};
