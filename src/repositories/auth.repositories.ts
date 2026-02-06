import type { users } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export const authRepositories = {
  signUp: async (data: {name: string, email:string,phone: string, password: string}): Promise<users> => {
    return prisma.users.create({ 
      data: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              password: data.password,
              email_verified: true,//por enquanto ficar como true, e no final ativar a verificacao por email e actualizar para falso
              last_access: null,
              date_register: new Date(),
      }
     });
  },
  findById: async (id: number): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { id },
    });
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
};
