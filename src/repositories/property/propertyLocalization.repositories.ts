import { prisma } from "../../../lib/prisma.js";

export const propertyLocalizationRepository = {
    createPropertyLocalization: async(property_id: number, latitude: number, longitude: number, address_info: string, neighborhood: string, municipality: string) => {
         return await prisma.propertyLocalization.create({
            data: {
                property_id,
                latitude,
                longitude,
                address_info,
                neighborhood,
                municipality
            }
        })         
    },

}