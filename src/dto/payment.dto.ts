import z from 'zod';

const propertyListingId = z.coerce
   .number("Property listing ID must be a positive number")
   .int()
   .positive();

export const paymentDto = z
   .object({
      property_listing_id: propertyListingId.optional(),
      listed_property_id: propertyListingId.optional(),
      paymentType: z.enum(["DIRECT_PURCHASE", "NEGOCIATED_PURCHASE"], "Invalid payment type"),
   })
   .transform((data, ctx) => {
      const property_listing_id = data.property_listing_id ?? data.listed_property_id;

      if (!property_listing_id) {
         ctx.addIssue({
            code: "custom",
            path: ["property_listing_id"],
            message: "Property listing ID is required",
         });

         return z.NEVER;
      }

      return {
         property_listing_id,
         paymentType: data.paymentType,
      };
   });

export const paymentActionDto = z.object({
   payment_id: z.coerce.number("Payment ID must be a positive number").int().positive(),
});

export type PaymentDto = z.infer<typeof paymentDto>;
export type PaymentActionDto = z.infer<typeof paymentActionDto>;
