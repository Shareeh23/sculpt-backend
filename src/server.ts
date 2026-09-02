import { validateEnv, env } from "./config/env.js";
import { logger } from "./config/logger.js";

validateEnv();

const startServer = async () => {
  try {
    logger.info("Starting server...");

    const [
      { default: app },
      { connectDatabase, default: client },
      { connectRedis, disconnectRedis },
      { seedPredefinedWorkoutPlans },
    ] = await Promise.all([
      import("./app.js"),
      import("./config/database.js"),
      import("./config/redis.js"),
      import("./services/predefined-workout-plan-seeder.service.js"),
    ]);

    await connectDatabase();
    logger.info({ database: "mongodb" }, "Database connected");

    await seedPredefinedWorkoutPlans();
    logger.info({ seeder: "predefined-workout-plans" }, "Predefined workout plans seeded");

    await connectRedis();
    logger.info({ cache: "redis" }, "Cache connected");

    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server running");
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutdown signal received, closing connections...");
      server.close(async () => {
        await client.close();
        await disconnectRedis();
        logger.info("Connections closed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();