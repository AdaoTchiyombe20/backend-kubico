import { prisma } from "../../../lib/prisma.js";
import { type propertyHistory, propertySelingStatus} from "../../../generated/prisma/index.js";

export const historyPropertyRepository = {
    findAll: async(id_property:number, limit: number, cursor: number):Promise<propertyHistory[]|[]>=>{
        return prisma.propertyHistory.findMany({
            where: { id_property },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1, 
            }),
            orderBy: { id: 'asc' },
            })||[]
    },
    createHistoryProperty: async(id_owner: number, id_property: number, last_status: propertySelingStatus, new_status: propertySelingStatus, ):Promise<propertyHistory> => {
        return prisma.propertyHistory.create({
            data: {
                id_owner,
                id_property,
                last_status,
                new_status,
            }
        })
    },
    updateHistoryProperty: async(id_history: number, last_status: propertySelingStatus, new_status: propertySelingStatus, ended_at: Date):Promise<propertyHistory> => {
        return prisma.propertyHistory.update({
            where: { id: id_history },
            data: {
                last_status,
                new_status,
                ended_at
            }
        })
    }
}