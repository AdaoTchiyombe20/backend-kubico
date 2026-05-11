import type { CompartmentsTypes } from "../../../generated/prisma/index.js"
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
    updatePropertyCompartments: async(id: number, data: {type: CompartmentsTypes | undefined, quantity: number | undefined}): Promise<void> => {
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
        ) as {type?: CompartmentsTypes, quantity?: number};
        
        await prisma.propertyCompartments.update({
            where: { id },
            data: cleanData
        })         
    },
    findPropertyCompartments: async(property_id: number) => {
        return await prisma.propertyCompartments.findMany({
            where: { property_id }
        })         
    }
}