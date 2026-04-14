"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createEmailConfirmationLink, sendEmailConfirmation } from "@/features/auth/magic-link";
import { loginAdminSchema, registerAdminSchema } from "@/features/auth/schemas";
import {
  clearAdminSession,
  createAdminSession,
  getCurrentAdmin,
  hashPassword,
  verifyPassword,
} from "@/features/auth/session";
import { logger } from "@/lib/logger";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  previewLink?: string;
};

export async function registerAdminAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel validar o cadastro.",
    };
  }

  const db = getDb();
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    return {
      status: "error",
      message: "Ja existe um administrador cadastrado com esse e-mail.",
    };
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      name: parsed.data.name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(parsed.data.password),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  const confirmationLink = await createEmailConfirmationLink(createdUser.id);
  const delivery = await sendEmailConfirmation({
    email: createdUser.email,
    name: createdUser.name,
    confirmationLink,
  });

  await createAdminSession(createdUser.id);
  revalidatePath("/");

  return {
    status: "success",
    message: delivery.delivered
      ? "Cadastro criado. Verifique seu e-mail para confirmar o acesso."
      : "Cadastro criado. Como o e-mail nao foi enviado automaticamente, use o link de confirmacao abaixo.",
    previewLink: delivery.previewOnly ? confirmationLink : undefined,
  };
}

export async function loginAdminAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel validar o login.",
    };
  }

  const db = getDb();
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      emailConfirmed: users.emailConfirmed,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return {
      status: "error",
      message: "Credenciais invalidas.",
    };
  }

  await createAdminSession(user.id);

  if (!user.emailConfirmed) {
    return {
      status: "success",
      message: "Login realizado, mas o e-mail ainda precisa ser confirmado.",
    };
  }

  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/");
}

export async function resendMagicLinkAction(): Promise<AuthActionState> {
  const user = await getCurrentAdmin();
  if (!user) {
    return {
      status: "error",
      message: "Sua sessao expirou. Entre novamente.",
    };
  }

  const confirmationLink = await createEmailConfirmationLink(user.id);
  const delivery = await sendEmailConfirmation({
    email: user.email,
    name: user.name,
    confirmationLink,
  });

  logger.info("Magic link resend requested", { userId: user.id });

  return {
    status: "success",
    message: delivery.delivered
      ? "Enviamos um novo link de confirmacao para o seu e-mail."
      : "Nao foi possivel enviar o e-mail automaticamente. Use o link abaixo.",
    previewLink: delivery.previewOnly ? confirmationLink : undefined,
  };
}
