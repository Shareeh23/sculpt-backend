import { describe, it, expect } from "vitest";
import { oneRepMaxService } from "../../src/services/1rm.service.ts";

describe("OneRepMaxService", () => {
  const service = oneRepMaxService;

  describe("calculateOneRepMax", () => {
    it("should calculate 1RM correctly for typical weight and reps", () => {
      // Epley formula: weight * (1 + reps / 30)
      // 225 lbs x 5 reps = 225 * (1 + 5/30) = 225 * 1.167 = 262.5 -> 263
      const result = service.calculateOneRepMax(225, 5);
      expect(result).toBe(263);
    });

    it("should calculate 1RM correctly for 1 rep (max weight)", () => {
      // 275 lbs x 1 rep = 275 * (1 + 1/30) = 275 * 1.033 = 284.25 -> 284
      const result = service.calculateOneRepMax(275, 1);
      expect(result).toBe(284);
    });

    it("should calculate 1RM correctly for high reps", () => {
      // 185 lbs x 10 reps = 185 * (1 + 10/30) = 185 * 1.333 = 246.67 -> 247
      const result = service.calculateOneRepMax(185, 10);
      expect(result).toBe(247);
    });

    it("should handle zero reps correctly", () => {
      // weight * (1 + 0/30) = weight
      const result = service.calculateOneRepMax(200, 0);
      expect(result).toBe(200);
    });

    it("should round to nearest integer", () => {
      const result = service.calculateOneRepMax(100, 3);
      // 100 * (1 + 3/30) = 100 * 1.1 = 110
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBe(110);
    });
  });

  describe("calculateTrainingWeights", () => {
    it("should calculate training weights correctly", () => {
      const result = service.calculateTrainingWeights(200);
      expect(result.fiftyPercent).toBe(100);
      expect(result.sixtyPercent).toBe(120);
      expect(result.seventyPercent).toBe(140);
      expect(result.eightyPercent).toBe(160);
      expect(result.ninetyPercent).toBe(180);
    });

    it("should round training weights correctly", () => {
      const result = service.calculateTrainingWeights(225);
      // 225 * 0.5 = 112.5 -> 113
      expect(result.fiftyPercent).toBe(113);
      // 225 * 0.6 = 135
      expect(result.sixtyPercent).toBe(135);
      // 225 * 0.7 = 157.5 -> 158
      expect(result.seventyPercent).toBe(158);
      // 225 * 0.8 = 180
      expect(result.eightyPercent).toBe(180);
      // 225 * 0.9 = 202.5 -> 203
      expect(result.ninetyPercent).toBe(203);
    });
  });

  describe("calculate", () => {
    it("should return both 1RM and training weights", () => {
      const result = service.calculate(200, 5);
      expect(result.oneRepMax).toBe(233);
      expect(result.trainingWeights).toBeDefined();
      expect(result.trainingWeights.fiftyPercent).toBe(117);
    });
  });
});