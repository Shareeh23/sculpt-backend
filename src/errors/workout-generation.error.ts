export class WorkoutGenerationError extends Error {
  readonly statusCode: number;
  readonly originalError: unknown;
  readonly requestData: {
    archetype: string;
    trainingDays: number;
  };

  constructor(
    message: string,
    options: {
      originalError?: unknown;
      requestData: {
        archetype: string;
        trainingDays: number;
      };
    },
  ) {
    super(message);

    this.name = "WorkoutGenerationError";
    this.statusCode = 502;
    this.originalError = options.originalError;
    this.requestData = options.requestData;

    Object.setPrototypeOf(this, WorkoutGenerationError.prototype);
  }
}