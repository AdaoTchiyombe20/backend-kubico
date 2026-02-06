import type { users, UserStatus } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export const userRepository = {
  findAll: async (): Promise<users[]> => {
    return prisma.users.findMany() || [];
  },
  findByEmail: async (email: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { email },
    });
  },
  findByPhone: async (phone: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { phone },
    });
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
  update: async (id: number,novosDados: Partial<{name: string,phone: string,password: string,status: UserStatus, email_verified: boolean, last_access: Date}>): Promise<users> => {
    return prisma.users.update({
      where: { id },
      data: novosDados,
    });
  },
updateStatus: async(id:number, status:boolean): Promise<void> => {
    await prisma.users.update({
      where: {id},
      data: {
      status: status ? 'ACTIVE' : 'SUSPENDED'
    }
    })
  },
  updateEmail: async (id: number, data: { email: string }) => {
    return await prisma.users.update({
      where: { id: id },
      data: { email: data.email },
    });
  },
};
