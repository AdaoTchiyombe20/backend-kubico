import type {
  DocType,
  profile_medias,
} from "../../../generated/prisma/index.js";
import { prisma } from "../../../lib/prisma.js";

export const profileMediaRepository = {
  insertMedia: async (
    profile_id: number,
    type: DocType,
    document_number: string | null,
    url: string,
    public_id: string
  ): Promise<void> => {
    await prisma.profile_medias.create({
      data: {
        profile_id,
        type,
        document_number: document_number ? document_number : null,
        url,
        public_id,
        uploaded_at: new Date(),
      },
    });
  },
upsertDocuments: async (
  profile_id: number,
  newDocs: { type: DocType; url?: string; public_id?: string; document_number?: string }[],
  allowedTypes: DocType[]
) => {
  for (const doc of newDocs) {
    if (!allowedTypes.includes(doc.type)) continue;

    const existing = await prisma.profile_medias.findFirst({
      where: { profile_id, type: doc.type, is_current: true },
    });

    if (existing) {
      await prisma.profile_medias.update({
        where: { id: existing.id },
        data: { is_current: false },
      });
    }

    await prisma.profile_medias.create({
      data: {
        profile_id,
        type: doc.type,
        url: doc.url ?? "",
        public_id: doc.public_id ?? "",  // ← estava em falta
        document_number: doc.document_number ?? null,
        is_current: true,
      },
    });
  }
},
  findAllUserMidiaById: async (id: number): Promise<profile_medias[]> => {
    return (
      (await prisma.profile_medias.findMany({
        where: { id },
      })) || []
    );
  },
};
