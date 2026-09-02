// Mocks for all external dependencies used in tests
// This file should be imported at the top of each test file before other imports

import { vi } from "vitest";

// Mock MongoDB to prevent real database connections
vi.mock("mongodb", () => ({
  MongoClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(true),
    db: vi.fn().mockReturnValue({
      collection: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
        insertOne: vi.fn().mockResolvedValue({ insertedId: "test-id" }),
        findOne: vi.fn().mockResolvedValue(null),
        updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      }),
    }),
    close: vi.fn().mockResolvedValue(true),
  })),
}));

// Mock Redis to prevent real connections
vi.mock("redis", () => ({
  create: vi.fn().mockReturnValue({
    connect: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    expire: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue(true),
  }),
}));

// Mock better-auth/node to simplify authentication testing
vi.mock("better-auth/node", () => ({
  toNodeHandler: vi.fn().mockImplementation((handler) => handler),
}));

// Mock services that depend on external connections
vi.mock("../../src/services/1rm.service.ts", () => ({
  oneRepMaxService: {
    calculate: vi.fn(),
    calculateOneRepMax: vi.fn(),
    calculateTrainingWeights: vi.fn(),
  },
}));

vi.mock("../../src/services/workout-generation.service.ts", () => ({
  workoutGenerationService: {
    generate: vi.fn(),
  },
}));

export {};