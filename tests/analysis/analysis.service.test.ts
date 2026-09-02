import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/repositories/analysis.repository.js", () => ({
  analysisRepository: {
    findExerciseHistory: vi.fn(),
  },
}));

import { AppError } from "../../src/errors/app-error.js";
import { analysisRepository } from "../../src/repositories/analysis.repository.js";
import { analysisService } from "../../src/services/analysis.service.js";

const exerciseLog = (
  date: string,
  name: string,
  weight: number,
  reps: number,
) => ({
  date: new Date(date),
  exercises: [
    {
      name,
      performedSets: [{ weight, reps }],
    },
  ],
});

describe("Analysis Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a single history point but waits for more data before calculating metrics or trends", async () => {
    vi.mocked(analysisRepository.findExerciseHistory).mockResolvedValue([
      exerciseLog("2026-01-01", "Bench Press", 100, 10),
    ]);

    const analysis = await analysisService.getAnalysis(
      "user-1",
      "  Bench Press  ",
    );

    expect(analysisRepository.findExerciseHistory).toHaveBeenCalledWith(
      "user-1",
      "Bench Press",
    );
    expect(analysis.history).toEqual([
      {
        date: new Date("2026-01-01"),
        weight: 100,
        volume: 1000,
        reps: 10,
      },
    ]);
    expect(analysis.metrics).toBeNull();
    expect(analysis.trends).toEqual({
      weight: "insufficient data",
      volume: "insufficient data",
    });
  });

  it("calculates progress metrics from two matching exercise logs", async () => {
    vi.mocked(analysisRepository.findExerciseHistory).mockResolvedValue([
      exerciseLog("2026-01-01", "Bench Press", 100, 10),
      exerciseLog("2026-01-08", "Bench Press", 105, 10),
    ]);

    const analysis = await analysisService.getAnalysis("user-1", "Bench Press");

    expect(analysis.metrics).toEqual({
      weight: {
        current: 105,
        change: 5,
        weeklyChange: 5,
      },
      volume: {
        current: 1050,
        change: 50,
        weeklyChange: 50,
      },
    });
    expect(analysis.trends).toEqual({
      weight: "insufficient data",
      volume: "insufficient data",
    });
  });

  it("calculates an upward trend from three matching exercise logs", async () => {
    vi.mocked(analysisRepository.findExerciseHistory).mockResolvedValue([
      exerciseLog("2026-01-01", "Bench Press", 100, 10),
      exerciseLog("2026-01-08", "Bench Press", 105, 10),
      exerciseLog("2026-01-15", "Bench Press", 110, 10),
    ]);

    const analysis = await analysisService.getAnalysis("user-1", "Bench Press");

    expect(analysis.trends.weight).toMatchObject({
      slope: 5,
      rSquared: 1,
      confidence: "high",
      isVolatile: false,
      direction: "up",
    });
    expect(analysis.trends.volume).toMatchObject({
      slope: 50,
      rSquared: 1,
      confidence: "high",
      isVolatile: false,
      direction: "up",
    });
  });

  it("returns a 404 when the user has no logs for the requested exercise", async () => {
    vi.mocked(analysisRepository.findExerciseHistory).mockResolvedValue([]);

    await expect(
      analysisService.getAnalysis("user-1", "Bench Press"),
    ).rejects.toMatchObject<AppError>({
      message: "No data",
      statusCode: 404,
    });
  });
});
