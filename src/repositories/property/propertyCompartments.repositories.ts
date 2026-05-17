import type { CompartmentsTypes, propertyCompartments } from "@prisma/client"
import { prisma } from "../../../lib/prisma.js"

export const propertyCompartmentsRepository = {
    createPropertyCompartments: async(property_id: number, type: CompartmentsTypes, quantity: number) => {
        return await prisma.propertyCompartments.create({
            data: {
                property_id,
                type,
                quantity
            }
        })         
    },
    updatePropertyCompartments: async(compartmentId: number, data: {type?: CompartmentsTypes, quantity?: number}):Promise<propertyCompartments> => {
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
            ) as {type?: CompartmentsTypes, quantity?: number};
        
        return prisma.propertyCompartments.update({
            where: { id: compartmentId },
            data: cleanData
            });
    },
    findPropertyCompartments: async(property_id: number) => {
        return await prisma.propertyCompartments.findMany({
            where: { property_id }
        })         
    }
}
