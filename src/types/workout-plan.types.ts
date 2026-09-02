export type WorkoutPlan = {
  userId: string;
  source: "ai" | "predefined";
  planName: string;
  programTheme: string;
  imageKey?: string;
  prioritizedMuscles: string[];
  neutralPoints: string[];
  weakPoints: string[];
  trainingDays: number;
  sessions: WorkoutSessionInput[];
  createdAt: Date;
  updatedAt: Date;
};

export type GenerateWorkoutInput = {
  archetype: string;
  trainingDays: number;
};

export type WorkoutAlternateExerciseInput = {
  name: string;
  sets: number;
  repRange: string;
};

export type WorkoutExerciseInput = {
  name: string;
  sets: number;
  repRange: string;
  alternates: WorkoutAlternateExerciseInput[];
};

export type WorkoutSessionInput = {
  sessionOrder: number;
  focusAreas: string[];
  exercises: WorkoutExerciseInput[];
  notes?: string;
};

export type WorkoutPlanInput = {
  source: "ai" | "predefined";
  planName: string;
  programTheme: string;
  imageKey?: string;
  prioritizedMuscles: string[];
  neutralPoints: string[];
  weakPoints: string[];
  trainingDays: number;
  sessions: WorkoutSessionInput[];
};
