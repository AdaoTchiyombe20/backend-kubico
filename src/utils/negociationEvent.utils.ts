// ============================================
// TIPOS
// ============================================

type NegociationEventType = "PROPOSAL" | "ACCEPTANCE" | "REJECTION" | "CANCELLATION" | "OTHER";

interface GenerateDescriptionContext {
    eventType: NegociationEventType;
    clientName: string;
    ownerName: string;
    proposedPrice: number;
    acceptedValue?: number;
    counterPrice?: number;
    message?: string;
}

// ============================================
// MAPA DE DESCRIÇÕES BASE
// ============================================

const EVENT_DESCRIPTIONS_MAP: Record<NegociationEventType, string> = {
    PROPOSAL: "Proposta de compra enviada",
    ACCEPTANCE: "Proposta aceita",
    REJECTION: "Proposta rejeitada",
    CANCELLATION: "Negociação cancelada",
    OTHER: "Evento de negociação",
};

// ============================================
// FUNÇÃO PRINCIPAL - Gerar Descrição
// ============================================

export function generateNegociationEventDescription(context: GenerateDescriptionContext): string {
    const {
        eventType,
        clientName,
        ownerName,
        proposedPrice,
        acceptedValue,
        counterPrice,
        message,
    } = context;

    let description = "";

    switch (eventType) {
        case "PROPOSAL":
            description = `${clientName} enviou uma proposta de compra por AOA ${proposedPrice.toLocaleString("pt-AO", {
                maximumFractionDigits: 2,
            })}`;
            if (message) {
                description += `. Mensagem: "${message}"`;
            }
            break;

        case "ACCEPTANCE":
            description = `${ownerName} aceitou a proposta de AOA ${acceptedValue || proposedPrice}`;
            if (message) {
                description += `. Observações: "${message}"`;
            }
            break;

        case "REJECTION":
            description = `${ownerName} rejeitou a proposta de AOA ${proposedPrice}`;
            if (message) {
                description += `. Motivo: "${message}"`;
            }
            break;

        case "CANCELLATION":
            description = `${clientName} cancelou a negociação`;
            if (message) {
                description += `. Razão: "${message}"`;
            }
            break;

        case "OTHER":
            description = message || "Evento de negociação registrado";
            break;

        default:
            description = "Evento de negociação";
    }

    return description;
}

// ============================================
// FUNÇÃO - Get Description Curta
// ============================================

export function getShortEventDescription(eventType: NegociationEventType): string {
    return EVENT_DESCRIPTIONS_MAP[eventType] || "Evento de negociação";
}

// ============================================
// EXPORTAR COMO OBJETO
// ============================================

export const NegociationEventDescriptions = {
    generateNegociationEventDescription,
    getShortEventDescription,
};
