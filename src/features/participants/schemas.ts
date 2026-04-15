import { z } from "zod";

export const reserveQuotaSchema = z.object({
  raffleId: z.string().uuid("Rifa invalida"),
  name: z.string().min(3, "Informe seu nome").max(180),
  email: z.string().email("Informe um e-mail valido").max(255),
  phone: z.string().min(10, "Informe o telefone com DDD").max(20),
});

export type ReserveQuotaInput = z.infer<typeof reserveQuotaSchema>;
