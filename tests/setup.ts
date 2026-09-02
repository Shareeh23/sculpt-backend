// Test setup - mocks database and external services
// This file runs before each test file

import { vi } from "vitest";

// Mock MongoDB - prevent actual connections
vi.mock("mongodb", () => {
  return {
    MongoClient: {
      connect: vi.fn().mockResolvedValue({ close: vi.fn() }),
      db: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          find: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([]),
          }),
          insertOne: vi.fn().mockResolvedValue({ insertedId: "mock-id" }),
          findOne: vi.fn(),
          updateOne: vi.fn().mockResolvedValue({ matchedCount: 0, modifiedCount: 0 }),
          deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }),
        }),
      }),
    },
  };
});

// Mock Redis - prevent actual connections
vi.mock("redis", () => ({
  create: vi.fn().mockReturnValue({
    connect: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    expire: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue(true),
  }),
}));

// Mock better-auth toNodeHandler
vi.mock("better-auth/node", () => ({
  toNodeHandler: vi.fn().mockImplementation((handler) => handler),
}));

// Mock services that depend on DB/Redis - these will be auto-mocked
// The actual mocks will be in individual test files as needed

export {};