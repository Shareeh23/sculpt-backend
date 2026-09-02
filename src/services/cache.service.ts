import { connectRedis, getRedis } from "../config/redis.js";

import { AppError } from "../errors/app-error.js";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    await connectRedis();

    const client = getRedis();

    const value = await client.get(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      throw new AppError(`Cache parse error for key "${key}"`, 500);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await connectRedis();

    const client = getRedis();

    await client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async delete(key: string): Promise<void> {
    await connectRedis();

    const client = getRedis();

    await client.del(key);
  }
}

export const cacheService = new CacheService();
