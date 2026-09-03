import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { validate } from "../../src/middleware/validate.js";

describe("validate middleware", () => {
  it("accepts a body-less GET request when the route expects an empty body", () => {
    const middleware = validate(
      z.object({
        body: z.object({}),
        params: z.object({
          exercise: z.string().trim().min(1),
        }),
        query: z.object({}),
      }),
    );
    const req = {
      body: undefined,
      params: { exercise: "Dumbbell Bench Press" },
      query: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    middleware(req as never, res as never, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({});
  });
});
