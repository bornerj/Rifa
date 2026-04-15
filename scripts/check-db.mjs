import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Database connection failed: DATABASE_URL is not defined.");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
});

try {
  const result = await sql`select now()::text as now`;
  console.info("Database connection OK at", result[0]?.now);
} catch (error) {
  console.error(
    "Database connection failed:",
    error instanceof Error ? error.message : "Unknown database error",
  );
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
