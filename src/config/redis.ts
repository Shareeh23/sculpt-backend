import { createClient, type RedisClientType } from "redis";

import { env } from "./env.js";
import { logger } from "./logger.js";

let redisClient: RedisClientType | null = null;
let connectionPromise: Promise<void> | null = null;

function getRedisClient(): RedisClientType {
  if (!redisClient) {
    redisClient = createClient({ url: env.REDIS_URL });

    redisClient.on("error", (error: Error) => {
      logger.error({ err: error, component: "redis" }, "Redis client error");
    });
  }
  return redisClient;
}

export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();

  if (client.isOpen) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = client
      .connect()
      .then(() => undefined)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
};

export const getRedis = (): RedisClientType => getRedisClient();

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
    connectionPromise = null;
  }
};