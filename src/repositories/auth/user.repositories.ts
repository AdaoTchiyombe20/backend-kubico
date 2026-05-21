import type { UserBanStatus, users } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const userRepository = {
  findAll: async (): Promise<users[]> => {
    return prisma.users.findMany() || [];
  },
  findByEmail: async (email: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { email },
    });
  },
  update: async(id:number, data: {email_verified: true}): Promise<users> => {
    return prisma.users.update({
      where: {id},
      data: {
        email_verified: data.email_verified
      }
    })
  },
  updateUserBanStatus: async(id:number, status:UserBanStatus, ended_at: Date | null): Promise<users> => {
    return prisma.users.update({
      where: {id},
      data: {
        banned: status,
        end_ban_at: ended_at
      }
    })
  },
  findById: async (id: number): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { id },
    });
  },
  delete: async (id: number): Promise<users> => {
    return prisma.users.delete({
      where: { id },
    });
  },
  updatePassword: async (id: number, password: string): Promise<users> => {
    return prisma.users.update({
      where: { id },
      data: password,
    });
  },
updateStatus: async(id:number, status:boolean,last_access: any): Promise<void> => {
    await prisma.users.update({
      where: {id},
      data: {
      status: status ? 'ACTIVE' : 'SUSPENDED',
      last_access: last_access? last_access: null
    }
    })
  },
   createUserRestrictionHistory: async (user_id: number, new_ban_status: UserBanStatus, ended_at: Date | null) => {
    await prisma.userRestrictionsHistory.updateMany({
      where: { user_id, is_active: true },
      data: { is_active: false }
    });

    return await prisma.userRestrictionsHistory.create({
      data: {
        user_id,
        new_ban_status,
        ended_at
      }
    })
  },
  updateUserRestrictionHistory: async (id: number, ended_at: Date) => {
    return await prisma.userRestrictionsHistory.update({
      where: { id },
      data: {
        is_active: false,
        ended_at
      }
    })
  },
  getCurrentUserRestrictionHistory: async (user_id: number) => {
    return await prisma.userRestrictionsHistory.findFirst({
      where: { user_id, is_active: true },
    })
  },
  updateEmail: async (id: number, email: string): Promise<users|null> => {
    return await prisma.users.update({
      where: { id: id },
      data: { 
        email: email,
        email_verified: true
      },
    });
  },
};
