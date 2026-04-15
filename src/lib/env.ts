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
  BREVO_SMTP_HOST: z.string().default("smtp-relay.brevo.com"),
  BREVO_SMTP_PORT: z.coerce.number().int().positive().default(587),
  BREVO_SMTP_USER: z.string().optional(),
  BREVO_SMTP_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().optional(),
  BREVO_SENDER_NAME: z.string().default("Rifa"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
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
    BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST,
    BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT,
    BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
    BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export function readOptionalServerEnv():
  | { success: true; data: z.infer<typeof runtimeSummarySchema> }
  | { success: false; error: string } {
  const result = runtimeSummarySchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL,
    BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST,
    BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT,
    BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
    BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
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
