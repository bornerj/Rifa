import { z } from "zod";

import { parseCurrencyInputToCents } from "@/lib/utils";

const imageUrlSchema = z.string().url("Informe uma URL valida para a imagem");
const quotaPriceSchema = z.string().transform((value, ctx) => {
  const cents = parseCurrencyInputToCents(value);

  if (cents === null || cents < 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe o valor da cota em reais, com minimo de R$ 1,00",
    });
    return z.NEVER;
  }

  return cents;
});

export const createRaffleSchema = z.object({
  name: z.string().min(3, "Informe o nome da rifa").max(180),
  purpose: z.string().min(10, "Explique o proposito da rifa").max(1000),
  beneficiary: z.string().min(3, "Informe o beneficiario").max(180),
  durationInDays: z.coerce.number().int().min(1).max(365),
  quotaPriceInCents: quotaPriceSchema,
  itemName: z.string().min(3, "Informe o nome do item da rifa").max(180),
  images: z
    .array(imageUrlSchema)
    .min(1, "Informe ao menos uma imagem")
    .max(3, "No MVP, sao permitidas no maximo 3 imagens"),
});

export const updateRafflePixSchema = z.object({
  pixLabel: z.string().trim().min(3, "Informe o identificador do PIX").max(180),
  pixPayload: z.string().trim().min(10, "Informe o payload copia e cola do PIX").max(2000),
});

export const updateRaffleItemSchema = z.object({
  itemName: z.string().trim().min(3, "Informe o nome do item da rifa").max(180),
  images: z
    .array(imageUrlSchema)
    .min(1, "Informe ao menos uma imagem")
    .max(3, "No MVP, sao permitidas no maximo 3 imagens"),
});

export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;
