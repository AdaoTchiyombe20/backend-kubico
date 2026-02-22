import {prisma} from "../../../lib/prisma.js"
import {ProfileType, type profiles } from '../../../generated/prisma/index.js'

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
    }
}