import z from "zod";

export const updateEmail = z.object({
  email: z.string().email("Formato de email inválido").toLowerCase().trim(),
});

export const updateUserPassword = z.object({
  password: z.string().min(6, "mínimo 6 caracteres"),
});

export const getUserId = z.object({
    id: z.coerce
    .number()
    .int("ID deve ser um número inteiro")
    .positive("ID deve ser positivo"),
  });
  
  // Types
export type UserUpdateEmailDTO = z.infer<typeof updateEmail>;
export type UpdateUserPassworsDTO = z.infer<typeof updateUserPassword>;
export type GetUserIdDTO = z.infer<typeof getUserId>;
