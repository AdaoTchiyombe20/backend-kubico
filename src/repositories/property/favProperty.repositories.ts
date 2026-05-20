import type { favorites } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const favPropertyRepository = {
    addFavorite: async (userId: number, property_id: number):Promise<void> => {
     await prisma.favorites.create({
            data: {
                owner_id: userId,
                property_id,
            },
        }); 
    },
    removeFavorite: async (userId: number, property_id: number):Promise<void> => {
        await prisma.favorites.delete({
            where: {
                owner_id_property_id: {
                    owner_id: userId,
                    property_id,
                }
            }
        })
    },
    findUserFavorites: async (userId: number, limit: number, cursor: number):Promise<favorites[] | []> => {
        return await prisma.favorites.findMany({
            where: { owner_id: userId },
            include: {
                properties: true 
            },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy: { id: 'asc' },
        }) || []
    }
}
