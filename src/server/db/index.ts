import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { readDatabaseEnv } from "@/lib/env";
import * as schema from "@/server/db/schema";

const globalForDb = globalThis as typeof globalThis & {
  __rifa_sql_client__?: ReturnType<typeof postgres>;
};

function createClient(): ReturnType<typeof postgres> {
  const env = readDatabaseEnv();

  if (!globalForDb.__rifa_sql_client__) {
    globalForDb.__rifa_sql_client__ = postgres(env.DATABASE_URL, {
      max: 1,
      prepare: false,
    });
  }

  return globalForDb.__rifa_sql_client__;
}

export function getDb() {
  return drizzle(createClient(), { schema });
}

export async function checkDatabaseConnection(): Promise<{
  ok: boolean;
  now?: string;
  error?: string;
}> {
  try {
    const sql = createClient();
    const result = await sql<{ now: string }[]>`select now()::text as now`;
    return { ok: true, now: result[0]?.now };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
