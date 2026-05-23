import z from 'zod';

export const paymentDto = z.object({
  property_id: z.number().positive(),
  negociation_id: z.number().positive().optional(),
  amount: z.number().positive(),
  payment_method: z.string().max(100),
});