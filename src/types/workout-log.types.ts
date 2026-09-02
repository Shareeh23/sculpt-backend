export type PerformedSetInput = {
  weight: number;
  reps: number;
};

export type ExerciseLogInput = {
  name: string;
  performedSets: PerformedSetInput[];
};

export type CreateWorkoutLogInput = {
  sessionOrder: number;
  exercises: ExerciseLogInput[];
};

export type UpdateWorkoutLogInput = {
  sessionOrder?: number;
  exercises?: ExerciseLogInput[];
};
