import { describe, it, expect, vi, beforeEach } from "vitest";
import { workoutService } from "../../src/services/workout.service.js";
import { AppError } from "../../src/errors/app-error.js";

// Mock repositories and external services
vi.mock("../../src/repositories/workout-plan.repository.js", () => ({
  workoutPlanRepository: {
    findByUserId: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../src/repositories/predefined-workout-plan.repository.js", () => ({
  predefinedWorkoutPlanRepository: {
    findByPlanKey: vi.fn(),
  },
}));

vi.mock("../../src/services/workout-generation.service.js", () => ({
  workoutGenerationService: {
    generate: vi.fn(),
  },
}));

vi.mock("../../src/services/cache.service.js", () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Import after mocking
import { workoutPlanRepository } from "../../src/repositories/workout-plan.repository.js";
import { predefinedWorkoutPlanRepository } from "../../src/repositories/predefined-workout-plan.repository.js";
import { workoutGenerationService } from "../../src/services/workout-generation.service.js";
import { cacheService } from "../../src/services/cache.service.js";

describe("Workout Service - Plan Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cacheService.get).mockResolvedValue(null);
  });

  describe("generateWorkoutPlan", () => {
    it("reuses a cached plan for the same character and training days", async () => {
      const cachedPlan = {
        source: "ai" as const,
        planName: "Batman Plan",
        programTheme: "Batman",
        prioritizedMuscles: ["back"],
        neutralPoints: ["chest"],
        weakPoints: ["legs"],
        trainingDays: 4,
        sessions: [],
      };
      vi.mocked(workoutPlanRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(cacheService.get).mockResolvedValue(cachedPlan);
      vi.mocked(workoutPlanRepository.create).mockResolvedValue({
        id: "plan-456",
      });

      await workoutService.generateWorkoutPlan("user456", {
        archetype: "  BATMAN  ",
        trainingDays: 4,
      });

      expect(cacheService.get).toHaveBeenCalledWith("workout:batman:4");
      expect(workoutGenerationService.generate).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
      expect(workoutPlanRepository.create).toHaveBeenCalledWith(
        "user456",
        cachedPlan,
      );
    });

    it("should generate a new workout plan from AI", async () => {
      vi.mocked(workoutPlanRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(workoutGenerationService.generate).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              Plan_Name: "Test Plan",
              Training_Days: 4,
              Program_Theme: "Strength",
              Strong_Points: ["chest", "back"],
              Neutral_Points: ["shoulders", "legs"],
              Weak_Points: ["biceps"],
              Workout_Schedule: [
                { Workout_Day: "Day 1", Focus_Areas: ["chest"], Exercises: [{ Name: "Bench Press", Sets: 3, Reps: "8-10" }] },
                { Workout_Day: "Day 2", Focus_Areas: ["back"], Exercises: [{ Name: "Pull-ups", Sets: 3, Reps: "8-12" }] },
                { Workout_Day: "Day 3", Focus_Areas: ["legs"], Exercises: [{ Name: "Squat", Sets: 4, Reps: "6-8" }] },
                { Workout_Day: "Day 4", Focus_Areas: ["shoulders"], Exercises: [{ Name: "Overhead Press", Sets: 3, Reps: "8-12" }] },
              ],
            }),
          },
        }],
      });
      vi.mocked(workoutPlanRepository.create).mockResolvedValue({
        id: "plan-123",
        userId: "user123",
        source: "ai",
      });

      await workoutService.generateWorkoutPlan("user123", {
        archetype: "athlete",
        trainingDays: 4,
      });

      expect(workoutPlanRepository.findByUserId).toHaveBeenCalledWith("user123");
      expect(cacheService.get).toHaveBeenCalledWith("workout:athlete:4");
      expect(workoutGenerationService.generate).toHaveBeenCalledWith("athlete", 4);
      expect(cacheService.set).toHaveBeenCalledWith(
        "workout:athlete:4",
        expect.objectContaining({
          source: "ai",
          planName: "Test Plan",
          trainingDays: 4,
        }),
        expect.any(Number),
      );
      expect(workoutPlanRepository.create).toHaveBeenCalledWith("user123", expect.objectContaining({
        source: "ai",
        planName: "Test Plan",
        programTheme: "Strength",
        prioritizedMuscles: ["chest", "back"],
        trainingDays: 4,
      }));
    });

    it("should throw error if user already has a workout plan", async () => {
      vi.mocked(workoutPlanRepository.findByUserId).mockResolvedValue({
        id: "plan-123",
        userId: "user123",
      });

      await expect(
        workoutService.generateWorkoutPlan("user123", {
          archetype: "athlete",
          trainingDays: 4,
        })
      ).rejects.toThrow("Workout plan already exists. Users cannot generate another plan.");
    });
  });

  describe("assignPredefinedPlan", () => {
    it("should assign a predefined workout plan", async () => {
      vi.mocked(workoutPlanRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(predefinedWorkoutPlanRepository.findByPlanKey).mockResolvedValue({
        planName: "Test Plan",
        programTheme: "Strength",
        prioritizedMuscles: ["chest", "back"],
        neutralPoints: ["shoulders", "legs"],
        weakPoints: ["biceps"],
        trainingDays: 4,
        sessions: [],
      });
      vi.mocked(workoutPlanRepository.create).mockResolvedValue({
        id: "plan-456",
      });

      await workoutService.assignPredefinedPlan("user123", "plan-abc");

      expect(predefinedWorkoutPlanRepository.findByPlanKey).toHaveBeenCalledWith("plan-abc");
      expect(workoutPlanRepository.findByUserId).toHaveBeenCalledWith("user123");
      expect(workoutPlanRepository.create).toHaveBeenCalledWith("user123", expect.objectContaining({
        source: "predefined",
        planName: "Test Plan",
        programTheme: "Strength",
        prioritizedMuscles: ["chest", "back"],
        trainingDays: 4,
      }));
    });

    it("should throw error if user already has a workout plan", async () => {
      vi.mocked(workoutPlanRepository.findByUserId).mockResolvedValue({
        id: "plan-123",
        userId: "user123",
      });

      await expect(
        workoutService.assignPredefinedPlan("user123", "plan-abc")
      ).rejects.toThrow("Workout plan already exists. Users cannot switch workout plans.");
    });

    it("should throw error if predefined plan is not found", async () => {
      vi.mocked(workoutPlanRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(predefinedWorkoutPlanRepository.findByPlanKey).mockResolvedValue(null);

      await expect(
        workoutService.assignPredefinedPlan("user123", "nonexistent-plan")
      ).rejects.toThrow("Predefined workout plan not found");
    });
  });
});