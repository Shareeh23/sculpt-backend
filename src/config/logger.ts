import pino, { type Logger, type LoggerOptions } from "pino";

import { env } from "./env.js";

const isDevelopment = env.NODE_ENV === "development";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.set-cookie",
  "req.headers.x-api-key",
  "req.body.password",
  "req.body.currentPassword",
  "req.body.newPassword",
  "req.body.token",
  "req.body.apiKey",
  "req.body.secret",
  "req.body.accessToken",
  "req.body.refreshToken",
  "req.body.clientSecret",
  "req.body.clientId",
  "req.query.password",
  "req.query.token",
  "req.query.apiKey",
  "req.query.secret",
  "res.headers.set-cookie",
  "res.headers.authorization",
  "DB_URL",
  "MONGO_DB_URL",
  "REDIS_URL",
  "OPENAI_API_KEY",
  "EMAIL_PASSWORD",
  "AWS_SECRET_ACCESS_KEY",
  "GOOGLE_CLIENT_SECRET",
];

const loggerOptions: LoggerOptions = {
  level: env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  base: {
    service: "sculpt-backend",
    environment: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
};

let logger: Logger;

if (isDevelopment) {
  const pretty = await import("pino-pretty");
  const stream = pretty.default({
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
    singleLine: false,
  });
  logger = pino(loggerOptions, stream);
} else {
  logger = pino(loggerOptions);
}

export { logger };

export type { Logger };