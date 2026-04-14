import { createHash, randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { readAuthEnv, readProviderEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getDb } from "@/server/db";
import { emailVerificationTokens, users } from "@/server/db/schema";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createEmailConfirmationLink(userId: string): Promise<string> {
  const db = getDb();
  const env = readAuthEnv();
  const token = randomBytes(24).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await db.insert(emailVerificationTokens).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return `${env.APP_URL}/confirmar-email?token=${token}`;
}

export async function sendEmailConfirmation({
  email,
  name,
  confirmationLink,
}: {
  email: string;
  name: string;
  confirmationLink: string;
}): Promise<{ delivered: boolean; previewOnly: boolean }> {
  const providers = readProviderEnv();

  if (!providers.RESEND_API_KEY || providers.RESEND_API_KEY === "development-preview") {
    logger.info("Magic link email preview generated", { email, confirmationLink });
    return { delivered: false, previewOnly: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${providers.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Rifa <onboarding@resend.dev>",
      to: [email],
      subject: "Confirme seu e-mail no Rifa",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Confirme seu cadastro, ${name}</h1>
          <p>Para liberar o painel administrativo da sua rifa, clique no link abaixo:</p>
          <p><a href="${confirmationLink}">${confirmationLink}</a></p>
          <p>Se voce nao solicitou esse cadastro, ignore este e-mail.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("Failed to send confirmation email", { email, errorText });
    return { delivered: false, previewOnly: true };
  }

  return { delivered: true, previewOnly: false };
}

export async function consumeEmailConfirmationToken(token: string) {
  const db = getDb();
  const tokenHash = hashToken(token);

  const [record] = await db
    .select({
      id: emailVerificationTokens.id,
      userId: emailVerificationTokens.userId,
      expiresAt: emailVerificationTokens.expiresAt,
      consumedAt: emailVerificationTokens.consumedAt,
    })
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.tokenHash, tokenHash))
    .limit(1);

  if (!record) {
    return { success: false as const, message: "Link invalido ou inexistente." };
  }

  if (record.consumedAt) {
    return { success: false as const, message: "Esse link ja foi utilizado." };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return { success: false as const, message: "Esse link expirou. Gere outro no painel." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        emailConfirmed: true,
      })
      .where(eq(users.id, record.userId));

    await tx
      .update(emailVerificationTokens)
      .set({
        consumedAt: new Date(),
      })
      .where(eq(emailVerificationTokens.id, record.id));
  });

  return { success: true as const, message: "E-mail confirmado com sucesso." };
}

export async function getLatestActiveConfirmationLink(userId: string): Promise<string | null> {
  const db = getDb();
  const env = readAuthEnv();
  const [record] = await db
    .select({
      id: emailVerificationTokens.id,
      tokenHash: emailVerificationTokens.tokenHash,
      expiresAt: emailVerificationTokens.expiresAt,
    })
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId))
    .limit(1);

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return `${env.APP_URL}/confirmar-email/pendente`;
}
