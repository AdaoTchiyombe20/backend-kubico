import type { PaymentType } from "@prisma/client";
import type { PaymentDto } from "../dto/payment.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { negociationRepository } from "../repositories/negociationEvent/negociation.repository.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";
import { PaymentsRepository } from "../repositories/payment/payments..repository.js";


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
            
            let paymentType: PaymentType
            if(findProperty.is_negotiable){
                paymentType = "NEGOCIATED_PURCHASE"
            }
            else{
                paymentType = "DIRECT_PURCHASE"
            }
            let findNegociation: any
            if(paymentType === "NEGOCIATED_PURCHASE"){
                 findNegociation = await negociationRepository.findNegociationByClientAndProperty(verifyClient.id,getListenProperty.id)

                /*  const createPayment= await CreatePayments(listed_property_id, client_id, ) */


            }
           



        }catch (error) {
            throw new AppError("Error processing payment", 500);
        }
    }
}

async function CreatePayments(properti_listing_id: number, client_id: number, owner_id: number, negociation_id: number | null, payment_type: PaymentType, amount: number, discount: number, property_title: string, property_price: number) {

    const plataform_fee = amount * (discount/100)
    const released_amound = amount - (amount * (discount/100))
    
    const createPayment = await PaymentsRepository.createPayments(properti_listing_id, client_id, owner_id, negociation_id, payment_type, amount, plataform_fee, released_amound, 'RELEASED', property_title, property_price)

    return { message: "Pagamento feito com sucesso", createPayment }

}