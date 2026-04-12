import { prisma } from "../../../lib/prisma.js";
import { type propertyMedia, type MediaTypes } from "../../../generated/prisma/index.js";

export const propertyMediaRepository = {
    createPropertyMedia: async(property_id: number, url: string, type: MediaTypes,public_id: string, order:number, ): Promise<propertyMedia> => {
        return prisma.propertyMedia.create({  
            data: {
                property_id,
                url,  
                type,
                public_id,
                order
            }       
        })
    }
}