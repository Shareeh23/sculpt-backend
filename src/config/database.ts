import mongoose from "mongoose";
import { MongoClient } from "mongodb";

import { env } from "./env.js";
import { logger } from "./logger.js";

const client = new MongoClient(env.MONGO_DB_URL, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
});

const dbName = env.MONGO_DB_NAME ?? "sculpt";

export const database = client.db(dbName);

export async function connectDatabase() {
  await client.connect();

  await mongoose.connect(env.MONGO_DB_URL, {
    dbName,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  logger.info({ database: dbName }, "Connected to MongoDB");
}

export default client;
