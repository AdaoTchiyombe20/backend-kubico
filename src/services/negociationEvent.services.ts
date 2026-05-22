import type {
    NegociationEventDtoType,
    AcceptNegociationDtoType,
    RejectNegociationDtoType,
    CounterOfferDtoType,
    CancelNegociationDtoType,
} from "../dto/negociationEvent.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { negociationRepository } from "../repositories/negociationEvent/negociation.repository.js";
import { negociationEventRepository } from "../repositories/negociationEvent/negociationEvent.repository.js";
import { companyProfileRepository } from "../repositories/Profile/companyProfile.repositories.js";
import { person_profilesRepository } from "../repositories/Profile/personProfiles.repositories.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";
import { generateNegociationEventDescription } from "../utils/negociationEvent.utils.js";

export const negociationEventService = {
    // ============================================
    // 1. INICIAR NEGOCIAÇÃO (Criar Proposta)
    // ============================================

    async initNegociationEvent(profile_id: number, data: NegociationEventDtoType) {
        const { property_id, offer_price, message } = data;
    
        // Validações
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const findProperty = await propertyRepository.findUniquePropertyById(property_id);
        if (!findProperty) throw new AppError("Propriedade não encontrada!", 404);

        if (!findProperty.is_negotiable) {
            throw new AppError("Propriedade não é negociável!", 400);
        }

        const findListingProperty = await propertyListingRepository.findListingByProfileIdAndPropertyId(
            profile_id
        );
        if (!findListingProperty) {
            throw new AppError("Anúncio da propriedade não encontrado!", 404);
        }

        // Encontrar o proprietário (profile_roles com role 1 = owner)
        const findClient = await profileRole.findProfileRoleByRole(findProperty.id_owner, 1);
        if (!findClient) throw new AppError("Proprietário não encontrado!", 404);

        // Verificar se já existe negociação pendente
        const existingNegociation = await negociationRepository.findNegociationByClientAndProperty(
            profile_id,
            findListingProperty.id
        );
        if (existingNegociation) {
            throw new AppError(
                "Já existe uma proposta pendente para esta propriedade. Aguarde a resposta do proprietário!",
                400
            );
        }

        // Criar negociação
        const negociation = await negociationRepository.createNegociation(
            profile_id,
            findClient.id,
            findListingProperty.id,
            offer_price,
            message ?? null
        );

        // Gerar descrição automática
        const eventDescription = generateNegociationEventDescription({
            eventType: "PROPOSAL",
            clientName: "Cliente",
            ownerName: "Proprietário",
            proposedPrice: offer_price,
            message: message ?? "",
        });

        // Criar evento de negociação
        await negociationEventRepository.createNegociationEvent(
            profile_id,
            negociation.id,
            "PROPOSAL",
            eventDescription
        );

        return {
            message: "Proposta enviada com sucesso!",
            data: negociation,
        };
    },

    // ============================================
    // 2. ACEITAR PROPOSTA
    // ============================================

    async acceptNegociation(profile_id: number, data: AcceptNegociationDtoType) {
        const { negociation_id, accepted_value, message } = data;

        // Validações
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const negociation = await negociationRepository.findNegociationById(negociation_id);
        if (!negociation) throw new AppError("Negociação não encontrada!", 404);

        // Verificar se é o proprietário
        if (negociation.owner_id !== profile_id) {
            throw new AppError("Apenas o proprietário pode aceitar a proposta!", 403);
        }

        // Verificar se está pendente
        if (negociation.status !== "PENDING") {
            throw new AppError("Apenas negociações pendentes podem ser aceitas!", 400);
        }

        // Atualizar status e valor aceito
        const updatedNegociation = await negociationRepository.acceptNegociation(
            negociation_id,
            accepted_value
        );

        // Gerar descrição automática
        const eventDescription = generateNegociationEventDescription({
            eventType: "ACCEPTANCE",
            clientName: "Cliente",
            ownerName: "Proprietário",
            proposedPrice: Number(negociation.proposed_price),
            acceptedValue: accepted_value,
            message: message ?? "",
        });

        // Criar evento
        await negociationEventRepository.createNegociationEvent(
            profile_id,
            negociation_id,
            "ACCEPTANCE",
            eventDescription
        );

        return {
            message: "Proposta aceita com sucesso!",
            data: updatedNegociation,
        };
    },

    // ============================================
    // 3. REJEITAR PROPOSTA
    // ============================================

    async rejectNegociation(profile_id: number, data: RejectNegociationDtoType) {
        const { negociation_id, message } = data;

        // Validações
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const negociation = await negociationRepository.findNegociationById(negociation_id);
        if (!negociation) throw new AppError("Negociação não encontrada!", 404);

        // Verificar se é o proprietário
        if (negociation.owner_id !== profile_id) {
            throw new AppError("Apenas o proprietário pode rejeitar a proposta!", 403);
        }

        // Verificar se está pendente
        if (negociation.status !== "PENDING") {
            throw new AppError("Apenas negociações pendentes podem ser rejeitadas!", 400);
        }

        // Atualizar status
        const updatedNegociation = await negociationRepository.updateNegociationStatus(
            negociation_id,
            "REJECTED"
        );

        // Gerar descrição automática
        const eventDescription = generateNegociationEventDescription({
            eventType: "REJECTION",
            clientName: "Cliente",
            ownerName: "Proprietário",
            proposedPrice: Number(negociation.proposed_price),
            message: message ?? "",
        });

        // Criar evento
        await negociationEventRepository.createNegociationEvent(
            profile_id,
            negociation_id,
            "REJECTION",
            eventDescription
        );

        return {
            message: "Proposta rejeitada!",
            data: updatedNegociation,
        };
    },

    // ============================================
    // 4. ENVIAR CONTRAPROPOSTA
    // ============================================

    async sendCounterOffer(profile_id: number, data: CounterOfferDtoType) {
        const { negociation_id, counter_price, message } = data;

        // Validações
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const negociation = await negociationRepository.findNegociationById(negociation_id);
        if (!negociation) throw new AppError("Negociação não encontrada!", 404);

        // Verificar se é o proprietário
        if (negociation.owner_id !== profile_id) {
            throw new AppError("Apenas o proprietário pode enviar contraproposta!", 403);
        }

        // Verificar se está pendente
        if (negociation.status !== "PENDING") {
            throw new AppError("Apenas negociações pendentes podem ter contraproposta!", 400);
        }

        // Gerar descrição automática
        const eventDescription = generateNegociationEventDescription({
            eventType: "CANCELLATION", // Você pode adicionar um novo tipo se quiser
            clientName: "Cliente",
            ownerName: "Proprietário",
            proposedPrice: Number(negociation.proposed_price),
            counterPrice: counter_price,
            message: message ?? "",
        });

        // Criar evento (sem mudar status)
        const event = await negociationEventRepository.createNegociationEvent(
            profile_id,
            negociation_id,
            "CANCELLATION", // Adicionar tipo de evento COUNTER_OFFER se necessário
            eventDescription
        );

        return {
            message: "Contraproposta enviada com sucesso!",
            data: {
                negociation,
                event,
            },
        };
    },

    // ============================================
    // 5. CANCELAR NEGOCIAÇÃO
    // ============================================

    async cancelNegociation(profile_id: number, data: CancelNegociationDtoType) {
        const { negociation_id, message } = data;

        // Validações
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const negociation = await negociationRepository.findNegociationById(negociation_id);
        if (!negociation) throw new AppError("Negociação não encontrada!", 404);

        // Verificar se é parte da negociação
        const isParty =
            negociation.client_id === profile_id || negociation.owner_id === profile_id;
        if (!isParty) {
            throw new AppError("Você não tem permissão para cancelar esta negociação!", 403);
        }

        // Verificar se já não foi finalizada
        if (negociation.status === "CANCELLED") {
            throw new AppError("Esta negociação já foi cancelada!", 400);
        }

        // Cancelar negociação
        const updatedNegociation = await negociationRepository.cancelNegociation(negociation_id);

        // Buscar dados do cliente e proprietário
        const clientProfile = await profileRepository.findById(negociation.client_id);
        const ownerProfile = await profileRepository.findById(negociation.owner_id);

        // Gerar descrição automática
        const eventDescription = generateNegociationEventDescription({
            eventType: "CANCELLATION",
            clientName: "Cliente",
            ownerName: "Proprietário",
            proposedPrice: Number(negociation.proposed_price),
            message: message ?? "",
        });

        // Criar evento
        await negociationEventRepository.createNegociationEvent(
            profile_id,
            negociation_id,
            "CANCELLATION",
            eventDescription
        );

        return {
            message: "Negociação cancelada com sucesso!",
            data: updatedNegociation,
        };
    },

    // ============================================
    // 6. OBTER HISTÓRICO DE EVENTOS
    // ============================================

    async getNegociationHistory(profile_id: number, negociation_id: number) {
        // Validações
        const negociation = await negociationRepository.findNegociationById(negociation_id);
        if (!negociation) throw new AppError("Negociação não encontrada!", 404);

        // Verificar se é parte da negociação
        const isParty =
            negociation.client_id === profile_id || negociation.owner_id === profile_id;
        if (!isParty) {
            throw new AppError(
                "Você não tem permissão para visualizar esta negociação!",
                403
            );
        }

        const events = await negociationEventRepository.findNegociationHistory(negociation_id);

        return {
            negociation_id,
            status: negociation.status,
            proposed_price: negociation.proposed_price,
            accepted_value: negociation.accepted_value,
            created_at: negociation.created_at,
            events,
        };
    },

    // ============================================
    // 7. LISTAR NEGOCIAÇÕES DO USUÁRIO
    // ============================================

    async getUserNegotiations(profile_id: number) {
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const negotiations = await negociationRepository.findUserNegotiations(profile_id);

        return {
            total: negotiations.length,
            data: negotiations,
        };
    },

    // ============================================
    // 8. LISTAR NEGOCIAÇÕES PENDENTES (Proprietário)
    // ============================================

    async getPendingNegotiations(profile_id: number) {
        const findUser = await profileRepository.findById(profile_id);
        if (!findUser) throw new AppError("Perfil não encontrado!", 404);

        const negotiations =
            await negociationRepository.findPendingNegotiationsByOwner(profile_id);

        return {
            total: negotiations.length,
            data: negotiations,
        };
    },
};