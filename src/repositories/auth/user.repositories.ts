import type { users } from "@prisma/client";
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
  updateEmail: async (id: number, email: string): Promise<users|null> => {
    return prisma.users.update({
      where: { id: id },
      data: { 
        email: email,
        email_verified: true
      },
    });
  },
};
