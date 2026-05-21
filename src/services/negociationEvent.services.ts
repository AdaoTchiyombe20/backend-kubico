import type { NegociationEventDtoType } from "../dto/negociationEvent.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { negociationRepository } from "../repositories/negociationEvent/negociation.repository.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";

export const negociationEventService = {
    async initNegociationEvent(profile_id: number, data: NegociationEventDtoType) {
        const { property_id, offer_price } = data;

        const findUser = await profileRepository.findById(profile_id);
        if(!findUser) throw new AppError("Perfil não encontrado!");
        
        const findClient = await profileRole.findProfileRoleByRole(property_id, 1);
        if(!findClient) throw new AppError("Cliente não encontrado!");

        const findProperty = await propertyRepository.findUniquePropertyById(property_id);
        if(!findProperty) throw new AppError("Propriedade não encontrada!");

        if(!findProperty.is_negotiable) throw new AppError("Propriedade não é negociável!");
        
        const findListingProperty = await propertyListingRepository.findListingByProfileIdAndPropertyId(profile_id, property_id);
        if(!findListingProperty) throw new AppError("Propriedade não encontrada!");

        const negociationEvent = await negociationRepository.createNegociationEvent(findClient.id, findProperty.id_owner, findListingProperty.id, offer_price);

        return {
            message: "Proposta enviada com sucesso!",
            negociationEvent
        }

        
    }
}