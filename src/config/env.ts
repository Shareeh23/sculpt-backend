const requiredEnvVars = [
  "MONGO_DB_URL",
  "REDIS_URL",
  "BETTER_AUTH_URL",
  "OPENAI_URL",
  "OPENAI_MODEL",
  "OPENAI_API_KEY",
  "EMAIL_USERNAME",
  "EMAIL_PASSWORD",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FRONTEND_URL",
  "PORT",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar =
  | "REDIS_CACHE_TTL"
  | "NODE_ENV"
  | "MONGO_DB_NAME"
  | "LOG_LEVEL";

export function validateEnv(): void {
  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

export function getEnv<T extends RequiredEnvVar>(key: T): string;
export function getEnv<T extends OptionalEnvVar>(key: T): string | undefined;
export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export const env = {
  MONGO_DB_URL: getEnv("MONGO_DB_URL")!,
  MONGO_DB_NAME: getEnv("MONGO_DB_NAME"),
  REDIS_URL: getEnv("REDIS_URL")!,
  OPENAI_URL: getEnv("OPENAI_URL")!,
  OPENAI_MODEL: getEnv("OPENAI_MODEL")!,
  OPENAI_API_KEY: getEnv("OPENAI_API_KEY")!,
  EMAIL_USERNAME: getEnv("EMAIL_USERNAME")!,
  EMAIL_PASSWORD: getEnv("EMAIL_PASSWORD")!,
  AWS_REGION: getEnv("AWS_REGION")!,
  AWS_S3_BUCKET_NAME: getEnv("AWS_S3_BUCKET_NAME")!,
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID")!,
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET")!,
  FRONTEND_URL: getEnv("FRONTEND_URL")!,
  BETTER_AUTH_URL: getEnv("BETTER_AUTH_URL")!,
  PORT: Number(getEnv("PORT") ?? "3000"),
  REDIS_CACHE_TTL: Number(getEnv("REDIS_CACHE_TTL") ?? "86400"),
  NODE_ENV: getEnv("NODE_ENV") ?? "development",
  LOG_LEVEL: getEnv("LOG_LEVEL"),
} as const;