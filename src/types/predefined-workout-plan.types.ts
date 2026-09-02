export type PredefinedWorkoutAlternateExerciseInput = {
  name: string;
  sets: number;
  repRange: string;
};

export type PredefinedWorkoutExerciseInput = {
  name: string;
  sets: number;
  repRange: string;
  alternates: PredefinedWorkoutAlternateExerciseInput[];
};

export type PredefinedWorkoutSessionInput = {
  sessionOrder: number;
  focusAreas: string[];
  exercises: PredefinedWorkoutExerciseInput[];
  notes?: string;
};

export type PredefinedWorkoutPlanInput = {
  planKey: string;
  planName: string;
  programTheme: string;
  imageKey?: string;
  prioritizedMuscles: string[];
  neutralPoints: string[];
  weakPoints: string[];
  trainingDays: number;
  sessions: PredefinedWorkoutSessionInput[];
};
