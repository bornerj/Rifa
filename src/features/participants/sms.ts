import { logger } from "@/lib/logger";
import { readProviderEnv } from "@/lib/env";

export async function sendOtpMessage({
  phone,
  code,
}: {
  phone: string;
  code: string;
}): Promise<{ delivered: boolean; previewCode?: string }> {
  const provider = readProviderEnv();

  if (
    !provider.SMS_PROVIDER_API_KEY ||
    provider.SMS_PROVIDER_API_KEY === "placeholder" ||
    !provider.SMS_PROVIDER_SENDER ||
    provider.SMS_PROVIDER_SENDER === "placeholder"
  ) {
    logger.info("SMS OTP preview generated", { phone, code });
    return {
      delivered: false,
      previewCode: code,
    };
  }

  logger.warn("SMS provider integration is configured as stub for now", { phone });

  return {
    delivered: false,
    previewCode: code,
  };
}
