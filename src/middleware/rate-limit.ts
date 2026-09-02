import type { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const defaultKeyGenerator = (req: Request): string => {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
};

export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const store = new Map<string, { count: number; resetTime: number }>();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.resetTime < now) {
        store.delete(key);
      }
    }
  }, windowMs);

  // The cleanup timer must not keep a process alive after the HTTP server
  // has stopped (for example, in tests or graceful shutdown).
  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = store.get(key);

    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + windowMs };
      store.set(key, record);
    }

    const shouldCount =
      (!skipSuccessfulRequests && !skipFailedRequests) ||
      (skipSuccessfulRequests && res.statusCode >= 400) ||
      (skipFailedRequests && res.statusCode < 400);

    if (shouldCount) {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetTime = new Date(record.resetTime).toISOString();

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime);

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader("Retry-After", retryAfter);

      return res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later",
        retryAfter,
      });
    }

    next();
  };
};

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  keyGenerator: (req) => `auth:${req.ip}`,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
});

export const aiGenerationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req) => `ai:${req.user?.id ?? req.ip}`,
});

export const fileUploadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyGenerator: (req) => `upload:${req.user?.id ?? req.ip}`,
});