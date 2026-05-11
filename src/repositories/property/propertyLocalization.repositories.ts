import type { Prisma, propertyLocalization } from "@prisma/client";
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
    updatePropertyLocalization: async(property_id: number, data: {/* latitude: number | undefined, longitude: number | undefined, */ address_info: string | undefined, neighborhood: string | undefined, municipality: string | undefined}): Promise<propertyLocalization|null> => {
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
        ) as Prisma.propertyLocalizationUpdateInput;

        return await prisma.propertyLocalization.update({
            where: { property_id },
            data: cleanData
        })         
    },
    findPropertyLocalization: async(property_id: number): Promise<propertyLocalization|null> => {
        return await prisma.propertyLocalization.findUnique({
            where: { property_id }
        })         
    }

}
