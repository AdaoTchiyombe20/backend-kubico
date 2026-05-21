import z from "zod";

export const NegociationEventDto = z.object({
    property_id: z.coerce
            .number()
            .refine(Number.isInteger, {
            message: "Property ID deve ser um número inteiro",
            })
            .refine((n) => n > 0, {
            message: "Property ID deve ser positivo",
            }),
    offer_price: z.string()
                    .transform(val => Number(val)) 
                    .pipe(
                        z.number()
                            .int("A proposta deve ser um número inteiro")
                            .positive("A proposta deve ser um valor positivo")
                            .max(2_147_483_647, "A proposta não pode ultrapassar o limite de inteiro")
                        ),
});

export type NegociationEventDtoType = z.infer<typeof NegociationEventDto>;