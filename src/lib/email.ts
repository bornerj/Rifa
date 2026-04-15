import nodemailer from "nodemailer";

import { readProviderEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

type SendTransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type EmailDeliveryResult = {
  delivered: boolean;
  previewOnly: boolean;
};

export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: SendTransactionalEmailInput): Promise<EmailDeliveryResult> {
  const provider = readProviderEnv();
  const smtpPassword = provider.BREVO_SMTP_KEY ?? provider.BREVO_API_KEY;

  if (
    !provider.BREVO_SMTP_USER ||
    !smtpPassword ||
    smtpPassword === "development-preview" ||
    !provider.BREVO_SENDER_EMAIL
  ) {
    logger.info("Transactional email preview generated", { to, subject });
    return { delivered: false, previewOnly: true };
  }

  const transporter = nodemailer.createTransport({
    host: provider.BREVO_SMTP_HOST,
    port: provider.BREVO_SMTP_PORT,
    secure: provider.BREVO_SMTP_PORT === 465,
    auth: {
      user: provider.BREVO_SMTP_USER,
      pass: smtpPassword,
    },
  });

  await transporter.sendMail({
    from: `"${provider.BREVO_SENDER_NAME}" <${provider.BREVO_SENDER_EMAIL}>`,
    to,
    subject,
    html,
  });

  return { delivered: true, previewOnly: false };
}
