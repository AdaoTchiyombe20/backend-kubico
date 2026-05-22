import z from "zod";

// ============================================
// DTO - CRIAR PROPOSTA / INICIAR NEGOCIAÇÃO
// ============================================

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
    message: z.string().min(2).max(255).optional()
});

export type NegociationEventDtoType = z.infer<typeof NegociationEventDto>;

// ============================================
// DTO - ACEITAR PROPOSTA
// ============================================

export const AcceptNegociationDto = z.object({
    negociation_id: z.coerce
        .number()
        .refine(Number.isInteger, {
            message: "Negociation ID deve ser um número inteiro",
        })
        .refine((n) => n > 0, {
            message: "Negociation ID deve ser positivo",
        }),
    accepted_value: z.string()
        .transform(val => Number(val))
        .pipe(
            z.number()
                .int("O valor aceito deve ser um número inteiro")
                .positive("O valor aceito deve ser um valor positivo")
                .max(2_147_483_647, "O valor não pode ultrapassar o limite de inteiro")
        ),
    message: z.string().min(2).max(255).optional()
});

export type AcceptNegociationDtoType = z.infer<typeof AcceptNegociationDto>;

// ============================================
// DTO - REJEITAR PROPOSTA
// ============================================

export const RejectNegociationDto = z.object({
    negociation_id: z.coerce
        .number()
        .refine(Number.isInteger, {
            message: "Negociation ID deve ser um número inteiro",
        })
        .refine((n) => n > 0, {
            message: "Negociation ID deve ser positivo",
        }),
    message: z.string().min(2).max(255).optional()
});

export type RejectNegociationDtoType = z.infer<typeof RejectNegociationDto>;

// ============================================
// DTO - ENVIAR CONTRAPROPOSTA
// ============================================

export const CounterOfferDto = z.object({
    negociation_id: z.coerce
        .number()
        .refine(Number.isInteger, {
            message: "Negociation ID deve ser um número inteiro",
        })
        .refine((n) => n > 0, {
            message: "Negociation ID deve ser positivo",
        }),
    counter_price: z.string()
        .transform(val => Number(val))
        .pipe(
            z.number()
                .int("A contraproposta deve ser um número inteiro")
                .positive("A contraproposta deve ser um valor positivo")
                .max(2_147_483_647, "A contraproposta não pode ultrapassar o limite de inteiro")
        ),
    message: z.string().min(2).max(255).optional()
});

export type CounterOfferDtoType = z.infer<typeof CounterOfferDto>;

// ============================================
// DTO - CANCELAR NEGOCIAÇÃO
// ============================================

export const CancelNegociationDto = z.object({
    negociation_id: z.coerce
        .number()
        .refine(Number.isInteger, {
            message: "Negociation ID deve ser um número inteiro",
        })
        .refine((n) => n > 0, {
            message: "Negociation ID deve ser positivo",
        }),
    message: z.string().min(2).max(255).optional()
});

export type CancelNegociationDtoType = z.infer<typeof CancelNegociationDto>;

// ============================================
// DTO - RESPOSTA PADRÃO
// ============================================

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
    negociationEvents: z.array(
        z.object({
            id: z.number(),
            event_type: z.enum(["PROPOSAL", "ACCEPTANCE", "REJECTION", "CANCELLATION", "OTHER"]),
            event_description: z.string(),
            event_date: z.date(),
        })
    ).optional()
});

export type NegociationResponseDtoType = z.infer<typeof NegociationResponseDto>;

// ============================================
// DTO - HISTÓRICO DE EVENTOS
// ============================================

export const NegociationEventResponseDto = z.object({
    id: z.number(),
    negociation_id: z.number(),
    profile_role_id: z.number(),
    event_type: z.enum(["PROPOSAL", "ACCEPTANCE", "REJECTION", "CANCELLATION", "OTHER"]),
    event_description: z.string(),
    event_date: z.date(),
});

export type NegociationEventResponseDtoType = z.infer<typeof NegociationEventResponseDto>;
