import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readAuthEnv } from "@/lib/env";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "rifa_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function hashSecret(value: string, salt?: string): string {
  const finalSalt = salt ?? randomBytes(16).toString("hex");
  const hashed = scryptSync(value, finalSalt, 64).toString("hex");
  return `${finalSalt}:${hashed}`;
}

function verifySecret(value: string, storedHash: string): boolean {
  const [salt, hashed] = storedHash.split(":");
  if (!salt || !hashed) {
    return false;
  }

  const attemptedHash = scryptSync(value, salt, 64);
  const storedBuffer = Buffer.from(hashed, "hex");

  if (storedBuffer.length !== attemptedHash.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, attemptedHash);
}

function signSession(payload: SessionPayload): string {
  const env = readAuthEnv();
  const serialized = JSON.stringify(payload);
  const encoded = Buffer.from(serialized).toString("base64url");
  const signature = createHmac("sha256", env.AUTH_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function readSignedSession(value: string): SessionPayload | null {
  const env = readAuthEnv();
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = createHmac("sha256", env.AUTH_SECRET).update(encoded).digest("base64url");
  if (expected !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    if (parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return hashSecret(password);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return verifySecret(password, storedHash);
}

export async function createAdminSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  cookieStore.set(
    SESSION_COOKIE,
    signSession({
      userId,
      expiresAt,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    },
  );
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawSession) {
    return null;
  }

  const session = readSignedSession(rawSession);
  if (!session) {
    return null;
  }

  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailConfirmed: users.emailConfirmed,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function requireCurrentAdmin() {
  const user = await getCurrentAdmin();
  if (!user) {
    redirect("/entrar");
  }
  return user;
}

export async function requireConfirmedAdmin() {
  const user = await requireCurrentAdmin();
  if (!user.emailConfirmed) {
    redirect("/confirmar-email/pendente");
  }
  return user;
}
