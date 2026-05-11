import type { company_profiles } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const companyProfileRepository = {
  createBase: async (
    profile_id: number,
    data: {
      legal_name: string;
    }
  ): Promise<company_profiles> => {
    return prisma.company_profiles.create({
      data: { profile_id, ...data },
    });
  },

  updateById: async (
    profile_id: number,
    data: Partial<Omit<company_profiles, "id" | "profile_id">>
  ): Promise<company_profiles> => {
    return prisma.company_profiles.update({
      where: { profile_id },
      data,
    });
  },

  findAll: async (): Promise<company_profiles[]> => {
    return prisma.company_profiles.findMany();
  },

  findById: async (profile_id: number): Promise<company_profiles | null> => {
    return prisma.company_profiles.findUnique({
      where: { profile_id },
    });
  },
};
