import type {
  DocType,
  profile_medias,
} from "../../../generated/prisma/index.js";
import { prisma } from "../../../lib/prisma.js";

export const profileMediaRepository = {
  insertMedia: async (
    profile_id: number,
    type: DocType,
    document_number: string
  ): Promise<void> => {
    await prisma.profile_medias.create({
      data: {
        profile_id,
        type,
        document_number,
        inserted_in: new Date(),
      },
    });
  },
  
  findAllUserMediaById: async (id: number): Promise<profile_medias[]> => {
    return (
      (await prisma.profile_medias.findMany({
        where: { id },
      })) || []
    );
  },
};
