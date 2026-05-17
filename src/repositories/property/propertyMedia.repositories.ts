import { prisma } from "../../../lib/prisma.js";
import { type propertyMedia, type MediaTypes } from "@prisma/client";

export const propertyMediaRepository = {
    createPropertyMedia: async(property_id: number, url: string, type: MediaTypes,public_id: string, order:number, ): Promise<propertyMedia> => {
        return prisma.propertyMedia.create({  
            data: {
                property_id,
                url,  
                type,
                public_id,
                order
            }       
        })
    }, 
    findAllPropertyMedia: async(property_id: number): Promise<propertyMedia[]|[]> => {
        return prisma.propertyMedia.findMany({
            where: { property_id },
            orderBy: { order: 'asc' }
        })||[]
    },
    deletePropertyMedia: async(id: number): Promise<propertyMedia> => {
        return prisma.propertyMedia.delete({
            where: { id }
        })
    },
    findPropertyMediaByType: async(property_id: number, type: MediaTypes): Promise<propertyMedia[]|[]> => {
      return prisma.propertyMedia.findMany({
        where: { property_id, type },
        orderBy: { order: 'asc' }
      })||[]
    },
    insertMedia: async(property_id: number, url: string, type: MediaTypes, public_id: string, order: number): Promise<propertyMedia> => {
        return prisma.propertyMedia.create({
            data: {
                property_id,
                url,
                type,
                public_id,
                order
            }
        })
    },
    findPropertyMediaById: async (id: number, property_id: number): Promise<propertyMedia | null> => {
  return prisma.propertyMedia.findFirst({
    where: { id, property_id },
  });
},

updatePropertyMedia: async (
  id: number,
  url: string,
  type: MediaTypes,
  public_id: string,
): Promise<propertyMedia> => {
  return prisma.propertyMedia.update({
    where: { id },
    data: { url, type, public_id },
  });
},
createPropertyMediaWithNextOrder: async (
    property_id: number,
    url: string,
    type: MediaTypes,
    public_id: string,
  ): Promise<propertyMedia> => {
    // Usar transação para garantir ordem sequencial
    return await prisma.$transaction(async (tx) => {
      // Buscar máxima ordem dentro da transação (garante locking)
      const maxOrderResult = await tx.propertyMedia.aggregate({
        where: { property_id },
        _max: { order: true },
      });
      
      const nextOrder = (maxOrderResult._max.order ?? -1) + 1;
      
      return await tx.propertyMedia.create({
        data: {
          property_id,
          url,
          type,
          public_id,
          order: nextOrder,
        },
      });
    });
  },
};

//===================================================================================
/* 
    // createProperty service — com tratamento de falhas por cenário

createProperty: async (
  data: {
    profile_id: number;
    title: string;
    type_purchase: Property_purchase;
    type_of_property: TypeProperties;
    description: string;
    price: number;
    total_area: number | undefined;
    address_info: string;
    neighborhood: string;
    municipality: string;
    compartments: { type: string; quantity: number }[];
    latitude: number | undefined;
    longitude: number | undefined;
  },
  files: { [fieldName: string]: Express.Multer.File[] },
) => {
  const status_property = "NAO_PUBLICADO" as PropertyStatus;
  const ownerRole = await profileRole.findProfileRoleByRole(data.profile_id, 2);
  if (!ownerRole) throw new AppError("Owner not found!", 404);

  const property = await propertyRepository.createProperty(
    ownerRole.id,
    data.title,
    data.type_purchase,
    data.type_of_property,
    data.description,
    status_property,
    data.price,
    data.total_area,
  );
  console.log("Propriedade criada com ID:", property.id);

  // ── Helper: marca status + regista histórico ──────────────────────────────
  const markAs = async (newStatus: PropertyStatus) => {
    await propertyRepository.updatePropertyStatus(property.id, newStatus);
    await historyPropertyRepository.createHistoryProperty(
      ownerRole.id,
      property.id,
      status_property,   // last = estado em que entrou neste fluxo
      newStatus,
    );
  };

  // ── 1. Compartments ───────────────────────────────────────────────────────
  const compartmentResults = await Promise.allSettled(
    data.compartments.map((compartment) =>
      propertyCompartmentsRepository.createPropertyCompartments(
        property.id,
        compartment.type.toUpperCase() as CompartmentsTypes,
        compartment.quantity,
      ),
    ),
  );

  const compartmentErrors = compartmentResults.filter((r) => r.status === "rejected");
  if (compartmentErrors.length > 0) {
    // Falha parcial ou total — propriedade ficou incompleta, precisa de revisão
    await markAs("EM_ANALISE");
    const reasons = compartmentErrors
      .map((r) =>
        r.status === "rejected"
          ? r.reason instanceof Error
            ? r.reason.message
            : String(r.reason)
          : "",
      )
      .join(" | ");
    throw new AppError(
      `Falha ao salvar ${compartmentErrors.length} compartimento(s). Propriedade marcada como EM_ANALISE. Detalhes: ${reasons}`,
      500,
    );
  }

  // ── 2. Upload de media ────────────────────────────────────────────────────
  const allFiles = Object.entries(files).flatMap(([fieldname, fieldFiles]) =>
    fieldFiles.map((file) => ({ fieldname, file })),
  );

  // Rastreia uploads bem-sucedidos no Cloudinary mas que falharam no DB
  // para que possamos limpar o lixo remoto
  const orphanedCloudinaryIds: string[] = [];

  const results = await Promise.allSettled(
    allFiles.map(({ fieldname, file }) =>
      limit(async () => {
        try {
          const resourceType = resolveResourceType(file.mimetype);
          const mediaType = resolveMediaType(file.mimetype);

          const result = await uploadToCloudinary(
            file.path,
            `properties/${property.id}/documents`,
            resourceType,
          );

          console.log(`Upload bem-sucedido para "${fieldname}":`, result);

          try {
            await propertyMediaRepository.createPropertyMedia(
              property.id,
              result.secure_url,
              mediaType,
              result.public_id,
              0,
            );
          } catch (dbError) {
            // Cloudinary OK, DB falhou → regista para limpeza posterior
            orphanedCloudinaryIds.push(result.public_id);
            const message =
              dbError instanceof Error ? dbError.message : String(dbError);
            throw new AppError(
              `Upload OK mas falha ao registar no DB para "${fieldname}": ${message}`,
              500,
            );
          }

          return { fieldname, url: result.secure_url, public_id: result.public_id };
        } catch (error) {
          if (error instanceof AppError) throw error;
          const message = error instanceof Error ? error.message : String(error);
          throw new AppError(`Erro ao enviar "${fieldname}": ${message}`, 500);
        } finally {
          await deleteTempFile(file.path);
        }
      }),
    ),
  );

  // Limpa ficheiros órfãos no Cloudinary (melhor-esforço, não bloqueia)
  if (orphanedCloudinaryIds.length > 0) {
    console.warn(
      `Limpando ${orphanedCloudinaryIds.length} ficheiro(s) órfão(s) no Cloudinary:`,
      orphanedCloudinaryIds,
    );
    await Promise.allSettled(
      orphanedCloudinaryIds.map((publicId) => deleteFromCloudinary(publicId)),
    );
  }

  const uploaded: Record<string, string> = {};
  const mediaErrors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      uploaded[result.value.fieldname] = result.value.url;
    } else {
      const message =
        result.reason instanceof AppError
          ? result.reason.message
          : String(result.reason);
      mediaErrors.push(message);
    }
  }

  if (mediaErrors.length > 0) {
    await markAs("EM_ANALISE");
    throw new AppError(
      `Falha no upload de ${mediaErrors.length} ficheiro(s). Propriedade marcada como EM_ANALISE. Detalhes: ${mediaErrors.join(" | ")}`,
      500,
    );
  }

  // ── 3. Localização ────────────────────────────────────────────────────────
  if (data.latitude && data.longitude) {
    try {
      await propertyLocalizationRepository.createPropertyLocalization(
        property.id,
        data.latitude,
        data.longitude,
        data.address_info,
        data.neighborhood,
        data.municipality,
      );
    } catch (locError) {
      // Propriedade e media existem, mas sem coordenadas não pode ser publicada
      await markAs("EM_ANALISE");
      const message = locError instanceof Error ? locError.message : String(locError);
      throw new AppError(
        `Falha ao salvar localização. Propriedade marcada como EM_ANALISE. Detalhes: ${message}`,
        500,
      );
    }
  }

  // ── 4. Histórico final (fluxo feliz) ──────────────────────────────────────
  await historyPropertyRepository.createHistoryProperty(
    ownerRole.id,
    property.id,
    "NAO_PUBLICADO",
    "NAO_PUBLICADO",
  );

  return uploaded;
},
*/
