import z from 'zod'

export const updateEmail = z.object({
    email: z.string()
        .email("Formato de email inválido")
        .toLowerCase()
        .trim()
})

export const createClient = z.object({
    bi: z.string()
        .trim()
        .length(14, "O BI deve conter exatamente 14 caracteres"),
    biUrl: z.string()
        .url("Formato de URL do BI inválido")
        .trim(),
    userPhotoUrl: z.string()
        .url("Formato de URL da foto inválido")
        .trim()
})

export const createOwner = z.object({
    nif: z.string()
        .trim()
        .length(14, "O NIF deve conter exatamente 14 caracteres"),
    ownerType: z.enum(['PF', 'PJ'], {
        message: "Tipo de proprietário deve ser 'PF' ou 'PJ'"
    }),
    companyName: z.string().trim().optional(),
    bankAcount: z.string()
        .trim()
        .length(21, "A conta bancaria deve conter exatamente 21 caracteres")
})

export const updateUser = z.object({
    name: z.string()
        .trim()
        .min(3, "O nome deve conter no mínimo 3 caracteres"),
    phone: z.string()
        .trim()
        .length(9, "O número de telefone angolano deve conter exatamente 9 caracteres")
        .regex(/^[0-9]+$/, "O telefone deve conter apenas números"),
    password: z.string()
        .min(6, "A password deve conter no mínimo 6 caracteres")
}).partial()

export const getUserId = z.object({
    id: z.coerce
        .number()
        .int("ID deve ser um número inteiro")
        .positive("ID deve ser positivo")
})

// Types
export type UserUpdateEmailDTO = z.infer<typeof updateEmail>
export type UserUpdateDTO = z.infer<typeof updateUser>
export type GetUserIdDTO = z.infer<typeof getUserId>
export type createClientDTO = z.infer<typeof createClient>
export type createOwnerDTO = z.infer<typeof createOwner>