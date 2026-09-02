import { pinoHttp } from "pino-http";
import type { Options as HttpLoggerOptions } from "pino-http";

import { logger } from "../config/logger.js";

const httpLoggerOptions: HttpLoggerOptions = {
  logger,
  useLevel: "info",
  autoLogging: {
    ignore: (req) => req.url === "/health" || req.url === "/favicon.ico",
  },
  genReqId: (req) => req.headers["x-request-id"] as string ?? "",
  customReceivedMessage: (req) => `request received: ${req.method} ${req.url}`,
  customSuccessMessage: (req, res) => `request completed: ${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res) => `request failed: ${req.method} ${req.url} ${res.statusCode}`,
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "responseTimeMs",
  },
  serializers: {
    req: (req) => {
      const r = req as { id?: string | number; method?: string; url?: string; route?: { path?: string }; query?: Record<string, unknown>; params?: Record<string, unknown>; headers?: Record<string, unknown>; ip?: string; socket?: { remotePort?: number } };
      return {
        id: r.id,
        method: r.method,
        url: r.url,
        path: r.route?.path ?? r.url,
        query: r.query,
        params: r.params,
        headers: {
          "user-agent": r.headers?.["user-agent"],
          "content-type": r.headers?.["content-type"],
          accept: r.headers?.accept,
          origin: r.headers?.origin,
          referer: r.headers?.referer,
          "x-forwarded-for": r.headers?.["x-forwarded-for"],
          "x-real-ip": r.headers?.["x-real-ip"],
        },
        remoteAddress: r.ip,
        remotePort: r.socket?.remotePort,
      };
    },
    res: (res) => {
      const r = res as { statusCode?: number; getHeader?: (name: string) => unknown };
      return {
        statusCode: r.statusCode,
        headers: {
          "content-type": r.getHeader?.("content-type"),
          "content-length": r.getHeader?.("content-length"),
        },
      };
    },
    err: (err) => {
      const e = err as Error & Record<string, unknown>;
      const { message: errorMessage, ...rest } = e;

      return {
        type: e.constructor.name,
        message: errorMessage,
        stack: e.stack,
        ...rest,
      };
    },
  },
};

export const httpLogger = pinoHttp(httpLoggerOptions);