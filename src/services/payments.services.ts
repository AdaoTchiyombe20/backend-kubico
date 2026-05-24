import type { PaymentDto } from "../dto/payment.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { negociationRepository } from "../repositories/negociationEvent/negociation.repository.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";


export const paymentsService = {
    processPayment: async (paymentData: PaymentDto) => {
        try{
            const { listed_property_id, client_id } = paymentData;
            const verifyClient = await profileRole.findProfileRoleByRole(client_id, 1);
            if (!verifyClient) {
                throw new AppError("Cliente nao encontrado ou nao possui o papel correto", 404);
            }
            const getListenProperty = await propertyListingRepository.findActiveListing(listed_property_id);

            if (!getListenProperty) {
                throw new AppError("Propriedade nao encontrada", 404);
            }

            const findProperty = await propertyRepository.findUniquePropertyById(getListenProperty.property_id)

            if(!findProperty)
                throw new AppError('propriedade nao encontrada ',404)
            

        }catch (error) {
            throw new AppError("Error processing payment", 500);
        }
    }
}