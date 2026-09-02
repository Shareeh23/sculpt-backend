class OneRepMaxService {
  calculateOneRepMax(weight: number, reps: number) {
    // Epley formula
    return Math.round(weight * (1 + reps / 30));
  }

  calculateTrainingWeights(oneRepMax: number) {
    return {
      fiftyPercent: Math.round(oneRepMax * 0.5),

      sixtyPercent: Math.round(oneRepMax * 0.6),

      seventyPercent: Math.round(oneRepMax * 0.7),

      eightyPercent: Math.round(oneRepMax * 0.8),

      ninetyPercent: Math.round(oneRepMax * 0.9),
    };
  }

  calculate(weight: number, reps: number) {
    const oneRepMax = this.calculateOneRepMax(weight, reps);

    return {
      oneRepMax,

      trainingWeights: this.calculateTrainingWeights(oneRepMax),
    };
  }
}

export const oneRepMaxService = new OneRepMaxService();
