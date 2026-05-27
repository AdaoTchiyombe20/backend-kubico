import z from "zod";

const positiveIntegerId = (field: string) =>
    z.coerce
        .number()
        .int(`${field} deve ser um numero inteiro`)
        .positive(`${field} deve ser positivo`);

const moneyValue = (field: string) =>
    z.coerce
        .number()
        .int(`${field} deve ser um numero inteiro`)
        .positive(`${field} deve ser um valor positivo`)
        .max(2_147_483_647, `${field} nao pode ultrapassar o limite de inteiro`);

const negociationEventTypes = [
    "PROPOSAL",
    "COUNTER_OFFER",
    "ACCEPTANCE",
    "REJECTION",
    "CANCELLATION",
    "OTHER",
] as const;

// DTO - CRIAR PROPOSTA / INICIAR NEGOCIACAO
export const NegociationEventDto = z.object({
    property_id: positiveIntegerId("Property ID"),
    offer_price: moneyValue("A proposta"),
    months: z.coerce.number().int().positive().optional(),
    message: z.string().min(2).max(255).optional(),
});

export type NegociationEventDtoType = z.infer<typeof NegociationEventDto>;

// DTO - ACEITAR PROPOSTA
export const AcceptNegociationDto = z.object({
    negociation_id: positiveIntegerId("Negociation ID"),
    accepted_value: moneyValue("O valor aceito"),
    message: z.string().min(2).max(255).optional(),
});

export type AcceptNegociationDtoType = z.infer<typeof AcceptNegociationDto>;

// DTO - REJEITAR PROPOSTA
export const RejectNegociationDto = z.object({
    negociation_id: positiveIntegerId("Negociation ID"),
    message: z.string().min(2).max(255).optional(),
});

export type RejectNegociationDtoType = z.infer<typeof RejectNegociationDto>;

// DTO - ENVIAR CONTRAPROPOSTA
export const CounterOfferDto = z.object({
    negociation_id: positiveIntegerId("Negociation ID"),
    counter_price: moneyValue("A contraproposta"),
    message: z.string().min(2).max(255).optional(),
});

export type CounterOfferDtoType = z.infer<typeof CounterOfferDto>;

// DTO - CANCELAR NEGOCIACAO
export const CancelNegociationDto = z.object({
    negociation_id: positiveIntegerId("Negociation ID"),
    message: z.string().min(2).max(255).optional(),
});

export type CancelNegociationDtoType = z.infer<typeof CancelNegociationDto>;

// DTO - RESPOSTA PADRAO
export const NegociationResponseDto = z.object({
    id: z.number(),
    property_listing_id: z.number(),
    client_id: z.number(),
    owner_id: z.number(),
    proposed_price: z.number(),
    accepted_value: z.number().nullable(),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]),
    created_at: z.date(),
    message: z.string().nullable(),
    negociationEvents: z
        .array(
            z.object({
                id: z.number(),
                event_type: z.enum(negociationEventTypes),
                event_description: z.string(),
                event_date: z.date(),
            })
        )
        .optional(),
});

export type NegociationResponseDtoType = z.infer<typeof NegociationResponseDto>;

// DTO - HISTORICO DE EVENTOS
export const NegociationEventResponseDto = z.object({
    id: z.number(),
    negociation_id: z.number(),
    profile_role_id: z.number(),
    event_type: z.enum(negociationEventTypes),
    event_description: z.string(),
    event_date: z.date(),
});

export type NegociationEventResponseDtoType = z.infer<typeof NegociationEventResponseDto>;
