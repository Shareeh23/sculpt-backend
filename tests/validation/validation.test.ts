import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import {
  createWorkoutLogSchema,
  updateWorkoutLogSchema,
  calculateOneRepMaxSchema,
  generateWorkoutSchema,
} from "../../src/schemas/workout.schema.js";
import { calculateMacrosSchema } from "../../src/schemas/nutrition.schema.js";
import { validate } from "../../src/middleware/validate.js";

describe("Workout Schema Validation", () => {
  describe("createWorkoutLogSchema", () => {
    it("should pass with valid workout log data", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
          exercises: [
            {
              name: "Bench Press",
              performedSets: [{ weight: 135, reps: 5 }],
            },
          ],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(true);
    });

    it("should fail when exercises is missing", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("exercises"))).toBe(true);
      }
    });

    it("should fail when exercises is empty array", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
          exercises: [],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail when exercise name is empty", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
          exercises: [
            {
              name: "",
              performedSets: [{ weight: 135, reps: 5 }],
            },
          ],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail when performedSets is empty", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
          exercises: [
            {
              name: "Squat",
              performedSets: [],
            },
          ],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail with invalid sessionOrder (less than 1)", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 0,
          exercises: [
            {
              name: "Squat",
              performedSets: [{ weight: 135, reps: 5 }],
            },
          ],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail with negative weight", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
          exercises: [
            {
              name: "Squat",
              performedSets: [{ weight: -10, reps: 5 }],
            },
          ],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail with invalid reps (0)", () => {
      const result = createWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 1,
          exercises: [
            {
              name: "Squat",
              performedSets: [{ weight: 135, reps: 0 }],
            },
          ],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateWorkoutLogSchema", () => {
    it("should pass with valid update data", () => {
      const result = updateWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 2,
          exercises: [
            {
              name: "Deadlift",
              performedSets: [{ weight: 200, reps: 3 }],
            },
          ],
        },
        params: { logId: "log-123" },
        query: {},
      });

      expect(result.success).toBe(true);
    });

    it("should pass with partial update (only sessionOrder)", () => {
      const result = updateWorkoutLogSchema.safeParse({
        body: {
          sessionOrder: 3,
        },
        params: { logId: "log-456" },
        query: {},
      });

      expect(result.success).toBe(true);
    });

    it("should fail when logId is missing", () => {
      const result = updateWorkoutLogSchema.safeParse({
        body: {
          exercises: [{ name: "Squat", performedSets: [{ weight: 135, reps: 5 }] }],
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe("generateWorkoutSchema", () => {
    it("should pass with valid generation input", () => {
      const result = generateWorkoutSchema.safeParse({
        body: {
          archetype: "strength",
          trainingDays: 4,
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(true);
    });

    it("should fail with archetype too short", () => {
      const result = generateWorkoutSchema.safeParse({
        body: {
          archetype: "",
          trainingDays: 4,
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail with trainingDays too low", () => {
      const result = generateWorkoutSchema.safeParse({
        body: {
          archetype: "athlete",
          trainingDays: 2,
        },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe("validate middleware", () => {
    it("passes Zod defaults to the controller", () => {
      const req = {
        body: { calories: 2400 },
        params: {},
        query: {},
      } as any;
      const next = vi.fn();

      validate(calculateMacrosSchema)(req, {} as any, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.body).toEqual({ calories: 2400, split: "40-30-30" });
    });
  });

  describe("calculateOneRepMaxSchema", () => {
    it("should pass with valid weight and reps", () => {
      const result = calculateOneRepMaxSchema.safeParse({
        body: { weight: 135, reps: 5 },
        params: {},
        query: {},
      });

      expect(result.success).toBe(true);
    });

    it("should fail when weight is too low", () => {
      const result = calculateOneRepMaxSchema.safeParse({
        body: { weight: 10, reps: 5 },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail when weight is too high", () => {
      const result = calculateOneRepMaxSchema.safeParse({
        body: { weight: 600, reps: 5 },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });

    it("should fail when reps exceeds max", () => {
      const result = calculateOneRepMaxSchema.safeParse({
        body: { weight: 135, reps: 15 },
        params: {},
        query: {},
      });

      expect(result.success).toBe(false);
    });
  });
});