import z from 'zod'

export const createClientCompanyComplete = z.object({
  nameOfCompany: z.string().min(3, "Mínimo 3 caracteres"),
  phone: z
  .string()
  .length(9, "9 digitos")
  .regex(/^[0-9]+$/, "Apenas números"),
  nif: z.string().length(6, "NIF deve ter 6 caracteres"),
  nameOfLegalRepresentative: z.string().min(3, "Mínimo 3 caracteres")
});

export const createOwnerCompanyComplete = z.object({
  nameOfCompany: z.string().min(3, "Mínimo 3 caracteres"),
  phone: z
    .string()
    .length(9, "9 caracteres")
    .regex(/^[0-9]+$/, "Apenas números"),
  nif: z.string().length(6, "6 caracteres"),
  bankAccount: z.string().length(21, "21 caracteres"),
});

export const createIndividualClient = z.object({
    fullName: z.string().min(3, "Mínimo 3 caracteres"),
    bi: z.string().length(14, "14 caracteres"),
    dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Data inválida")
    .transform((date) => new Date(date)),
    phone: z
    .string()
    .length(9, "9 caracteres")
    .regex(/^[0-9]+$/, "Apenas números"),
  });
  
  export const createIndividualOwner = z.object({
    ownerName: z.string().min(3, "Mínimo 3 caracteres"),
    phone: z
    .string()
    .length(9, "9 caracteres")
    .regex(/^[0-9]+$/, "Apenas números"),
    bi: z.string().length(14, "14 caracteres"),
    nif: z.string().length(6, "6 caracteres"),
    bankAccount: z.string().length(21, "21 caracteres"),
    dateOfBirth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Data inválida")
      .transform((date) => new Date(date)),
});

export type CreateClientCompanyDTO = z.infer<typeof createClientCompanyComplete>;
export type CreateOwnerCompanyDTO = z.infer<typeof createOwnerCompanyComplete>;
export type CreateIndividualClientDTO = z.infer<typeof createIndividualClient>;
export type CreateIndividualOwnerDTO = z.infer<typeof createIndividualOwner>;
