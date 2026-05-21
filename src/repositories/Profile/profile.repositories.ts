import {prisma} from "../../../lib/prisma.js"
import {ProfileType, type profiles } from '@prisma/client'

export const profileRepository = {
    createProfile: async(user_id: number, typeOfUser: ProfileType ): Promise<profiles> => {
        return prisma.profiles.create({
            data: {
                user_id,
                type: typeOfUser
            }
        })
    }, 
    findByUserId: async (user_id: number): Promise<profiles | null> => {
        return prisma.profiles.findUnique({
            where: {user_id}
        })
    },
    findById: async (id: number): Promise<profiles | null> => {
        return prisma.profiles.findUnique({
            where: {id}
        })
    },
    findAll: async(limit: number, lastPropertyId: number):Promise<profiles[] | []> => {
        return prisma.profiles.findMany({
             where: {
                    ...(lastPropertyId > 0 && { id: { gt: lastPropertyId } }),
                  },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true,
                        email_verified: true,
                        last_access: true,
                        date_register: true   
                    }
                },
                person_profile: true,
                company_profile: true
            },
            orderBy: { id: "asc" },
            take: limit + 1
        }) || []
    },
    deleteProfile: async(user_id: number):Promise<profiles|null> => {
        return prisma.profiles.delete({
            where: {user_id}
        })
    },
    findByIdAnfType: async(id: number, type: ProfileType): Promise<profiles | null> => {
        return prisma.profiles.findUnique({
            where: {
                id,
                type
            }
        })
    }
}
