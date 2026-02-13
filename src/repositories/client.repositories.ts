import type { clients } from '../../generated/prisma/index.js'
import {prisma} from '../../lib/prisma.js'

export const clientsRepository = {
    createClient: async (userId: number): Promise<clients> => {
     return prisma.clients.create({
        data: {
            user_role_id: userId,
            date_register:new Date,
        }
     })   
    }, 
    findAll : async(): Promise<clients[]> => {
        return prisma.clients.findMany() || []
    }, 
    findById: async(id: number): Promise<clients | null> => {
        return prisma.clients.findUnique({
            where: {id}
        })
    }
}