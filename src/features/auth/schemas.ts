import { z } from "zod";

export const registerAdminSchema = z
  .object({
    name: z.string().min(3, "Informe seu nome").max(160),
    email: z.string().email("Informe um e-mail valido").max(255),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(128),
    confirmPassword: z.string().min(8, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais",
    path: ["confirmPassword"],
  });

export const loginAdminSchema = z.object({
  email: z.string().email("Informe um e-mail valido").max(255),
  password: z.string().min(8, "Informe sua senha"),
});

export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;
