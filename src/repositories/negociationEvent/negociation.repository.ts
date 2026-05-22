import { prisma } from "../../../lib/prisma.js";
import type { negociation } from "@prisma/client";

export const negociationRepository = {
    createNegociation: async (client_id: number, owner_id: number, property_listing_id: number, proposed_price: number, message: string | null): Promise<negociation> => {
        return await prisma.negociation.create({
            data: {
                client_id,
                owner_id,
                property_listing_id,
                status: 'PENDING',
                proposed_price,
                message
            }
        })
    }, 
    findNegociationById: async (id: number, property_listing_id: number): Promise<negociation | null> => {
        return await prisma.negociation.findFirst({
            where: {
                client_id: id,
                property_listing_id
            }
        })
    }
}