import type { person_profiles } from "../../../generated/prisma/index.js";
import { prisma } from "../../../lib/prisma.js";

export const person_profilesRepository = {
  createBase: async (
    profile_id: number,
    data: {
      full_name: string;
      birth_date: Date;
      phone: string;
    }
  ): Promise<person_profiles> => {
    return prisma.person_profiles.create({
      data: { profile_id, ...data },
    });
  },
    updateById: async (
    profile_id: number,
    data: Partial<Omit<person_profiles, "id" | "profile_id">>
  ): Promise<person_profiles> => {
    return prisma.person_profiles.update({
      where: { profile_id },
      data,
    });
  },
  findAll: async (): Promise<person_profiles[]> => {
    return prisma.person_profiles.findMany() || [];
  },
  findById: async (profile_id: number): Promise<person_profiles | null> => {
    return prisma.person_profiles.findUnique({
      where: { profile_id },
    });
  },
};
