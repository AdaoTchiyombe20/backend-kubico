import { prisma } from "../../../lib/prisma.js";
import type { negociationEvent, NegociationEventType } from "@prisma/client";

export const negociationEventRepository = {
    createNegociationEvent: async (profile_role_id: number, negociation_id: number, owner_id: number, property_listing_id: number, event_type: NegociationEventType, event_description: string): Promise<negociationEvent> => {
        return await prisma.negociationEvent.create({
            data: {
                negociation_id,
                profile_role_id,
                event_type,
                event_description
            }
        })

    }
}