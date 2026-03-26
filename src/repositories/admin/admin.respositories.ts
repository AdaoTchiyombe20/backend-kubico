import {AccessLevel, type admins } from "../../../generated/prisma/index.js";
import { prisma } from "../../../lib/prisma.js";

export const adminRepository = { 
    createAdmin: async(user_id:number, profile_role_id: number,accessLevel: AccessLevel): Promise<admins> => {
        return prisma.admins.create({
            data: {
                profile_role_id,
                user_id,
                accessLevel,
                deleted_at: null


            }
        })
    }
}