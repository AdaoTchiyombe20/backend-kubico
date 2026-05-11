import type { DocType, profile_data } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const profileMediaRepository = {
  insertMedia: async (
    profile_id: number,
    type: DocType,
    document_number: string
  ): Promise<void> => {
    await prisma.profile_data.create({
      data: { profile_id, type, document_number },
    });
  },

  findAllUserMediaById: async (profile_id: number): Promise<profile_data[]> => {
    return prisma.profile_data.findMany({
      where: { profile_id },
    });
  },

  findByTypeAndValue: async (type: DocType, value: string): Promise<profile_data | null> => {
    return prisma.profile_data.findFirst({
      where: { type, document_number: value },
    });
  },

  findByProfileAndType: async (profile_id: number, type: DocType): Promise<profile_data | null> => {
    return prisma.profile_data.findFirst({
      where: { profile_id, type },
    });
  },
};
