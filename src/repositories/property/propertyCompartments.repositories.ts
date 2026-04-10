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
    }   
}