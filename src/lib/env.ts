import { z } from "zod";

const authEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  APP_URL: z.string().url("APP_URL must be a valid URL"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const providerEnvSchema = z.object({
  RESEND_API_KEY: z.string().optional(),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  SMS_PROVIDER_SENDER: z.string().optional(),
});

const runtimeSummarySchema = authEnvSchema.merge(databaseEnvSchema).merge(providerEnvSchema);

export type AuthEnv = z.infer<typeof authEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export function readAuthEnv(): AuthEnv {
  return authEnvSchema.parse({
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}

export function readDatabaseEnv(): DatabaseEnv {
  return databaseEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
  });
}

export function readProviderEnv() {
  return providerEnvSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMS_PROVIDER_API_KEY: process.env.SMS_PROVIDER_API_KEY,
    SMS_PROVIDER_SENDER: process.env.SMS_PROVIDER_SENDER,
  });
}

export function readOptionalServerEnv():
  | { success: true; data: z.infer<typeof runtimeSummarySchema> }
  | { success: false; error: string } {
  const result = runtimeSummarySchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMS_PROVIDER_API_KEY: process.env.SMS_PROVIDER_API_KEY,
    SMS_PROVIDER_SENDER: process.env.SMS_PROVIDER_SENDER,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues.map((issue) => issue.message).join("; "),
  };
}
