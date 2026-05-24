import z from 'zod';

export const paymentDto = z.object({
   listed_property_id: z.number("Property ID must be a positive number").positive(),
   amount: z.string()
                .transform(val => Number(val)) 
                .pipe(
                    z.number()
                    .int("O valor pago (amount) deve ser um número inteiro")
                    .positive("O valor pago (amount) deve ser um valor positivo")
                    .max(2_147_483_647, "O valor pago (amount) não pode ultrapassar o limite de inteiro")
                ),
  client_id: z.number("Client ID must be a positive number").positive(),
});

export type PaymentDto = z.infer<typeof paymentDto>;