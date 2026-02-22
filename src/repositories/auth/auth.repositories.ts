import type { users } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

export const authRepositories = {
  signUp: async (data: { email: string; password: string }): Promise<users> => {
    return prisma.users.create({
      data: {
        email: data.email,
        password: data.password,
        email_verified: true, //por enquanto ficar como true, e no final ativar a verificacao por email e actualizar para falso
        last_access: null,
        date_register: new Date(),
      },
    });
  },
  findById: async (id: number): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { id },
    });
  },
  updateEmail: async (
    email: string,
    email_verified: boolean,
  ): Promise<users | null> => {
    return prisma.users.update({
      where: { email },
      data: {
        email_verified,
      },
    });
  },
  findByEmail: async (email: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { email },
    });
  },
  /*   findByPhone: async (phone: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { phone },
    });
  }, */
};
