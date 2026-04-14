import { z } from "zod";

export const requestOtpSchema = z.object({
  raffleId: z.string().uuid("Rifa invalida"),
  name: z.string().min(3, "Informe seu nome").max(180),
  phone: z.string().min(10, "Informe o telefone com DDD").max(20),
});

export const reserveQuotaSchema = z.object({
  raffleId: z.string().uuid("Rifa invalida"),
  name: z.string().min(3, "Informe seu nome").max(180),
  phone: z.string().min(10, "Informe o telefone com DDD").max(20),
  otpCode: z.string().regex(/^\d{6}$/, "Informe o codigo de 6 digitos"),
  quantity: z.coerce.number().int().min(1).max(50),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type ReserveQuotaInput = z.infer<typeof reserveQuotaSchema>;
