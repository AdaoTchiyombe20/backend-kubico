import z from 'zod';

export const paymentDto = z.object({
   listed_property_id: z.number("Property ID must be a positive number").positive(),
   paymentType: z.enum(["DIRECT_PURCHASE", "NEGOCIATED_PURCHASE"], "Invalid payment type"),
});

export type PaymentDto = z.infer<typeof paymentDto>;