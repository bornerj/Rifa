import { z } from "zod";

const imageUrlSchema = z.string().url("Informe uma URL valida para a imagem");

export const createRaffleSchema = z.object({
  name: z.string().min(3, "Informe o nome da rifa").max(180),
  purpose: z.string().min(10, "Explique o proposito da rifa").max(1000),
  beneficiary: z.string().min(3, "Informe o beneficiario").max(180),
  durationInDays: z.coerce.number().int().min(1).max(365),
  quotaPriceInCents: z.coerce.number().int().min(100),
  pixLabel: z.string().min(3, "Informe o identificador do PIX").max(180),
  pixPayload: z.string().min(10, "Informe o payload copia e cola do PIX").max(2000),
  itemName: z.string().min(3, "Informe o nome do item da rifa").max(180),
  images: z
    .array(imageUrlSchema)
    .min(1, "Informe ao menos uma imagem")
    .max(3, "No MVP, sao permitidas no maximo 3 imagens"),
});

export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;
