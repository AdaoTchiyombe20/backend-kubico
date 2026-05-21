import { prisma } from "../../../lib/prisma.js";
import type { negociation } from "@prisma/client";

export const negociationRepository = {
    createNegociationEvent: async (client_id: number, owner_id: number, property_listing_id: number, proposed_price: number): Promise<negociation> => {
        return await prisma.negociation.create({
            data: {
                client_id,
                owner_id,
                property_listing_id,
                status: 'PENDING',
                proposed_price
            }
        })
    }
}