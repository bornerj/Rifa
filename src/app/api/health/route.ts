import { NextResponse } from "next/server";

import { readOptionalServerEnv } from "@/lib/env";
import { checkDatabaseConnection } from "@/server/db";

export async function GET(): Promise<NextResponse> {
  const env = readOptionalServerEnv();

  if (!env.success) {
    return NextResponse.json(
      {
        status: "warning",
        envReady: false,
        databaseReady: false,
        message: env.error,
      },
      { status: 200 },
    );
  }

  const db = await checkDatabaseConnection();

  return NextResponse.json({
    status: db.ok ? "ok" : "warning",
    envReady: true,
    databaseReady: db.ok,
    databaseTime: db.now ?? null,
    error: db.error ?? null,
  });
}
