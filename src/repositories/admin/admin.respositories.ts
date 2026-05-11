import {AccessLevel, type admins } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const adminRepository = { 
    createAdmin: async(user_id:number,adminsName:string, profile_role_id: number,accessLevel: AccessLevel): Promise<admins> => {
        return prisma.admins.create({
            data: {
                profile_role_id,
                user_id,
                adminsName,
                access_level: accessLevel,
                deleted_at: null
            }
        })
    }, 
    findAdmin: async(profile_role_id: number, user_id: number): Promise<admins|null>=>{
        return prisma.admins.findUnique({
            where: {user_id, profile_role_id}
        }) || null
    }
}
