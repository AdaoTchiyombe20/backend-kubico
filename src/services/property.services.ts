import type { CompartmentsTypes, Property_purchase, PropertyStatus, propertySelingStatus, TypeProperties } from "../../generated/prisma/index.js";
import { AppError } from "../errors/App.Errors.js";
import { deleteTempFile, uploadToCloudinary } from "../middlewares/multer.middleware.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { historyPropertyRepository } from "../repositories/property/historyProperty.respositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyCompartmentsRepository } from "../repositories/property/propertyCompartments.repositories.js";
import { propertyLocalizationRepository } from "../repositories/property/propertyLocalization.repositories.js";
import { propertyMediaRepository } from "../repositories/property/propertyMedia.repositories.js";
import pLimit from "p-limit";

type MediaType = "IMAGEM" | "VIDEO";

const resolveResourceType = (mimetype: string): "image" | "video" => {
  if (mimetype.startsWith("image/")) return "image";
  return "video";
};

const resolveMediaType = (mimetype: string): MediaType => {
  if (mimetype.startsWith("image/")) return "IMAGEM";
  return "VIDEO";
};

const limit = pLimit(3); 

export const propertyService = {
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
    const propertySelingStatus = "DISPONIVEL" as propertySelingStatus;
    const ownerRole = await profileRole.findProfileRoleByRole(data.profile_id, 2);
    if (!ownerRole) throw new AppError("Owner not found!", 404);

    const property = await propertyRepository.createProperty(
      ownerRole.id,
      data.title,
      data.type_purchase,
      data.type_of_property,
      data.description,
      status_property,
      propertySelingStatus,
      data.price,
      data.total_area,
    );
    console.log("Propriedade criada com ID:", property.id);

    const markAsPropertyStatus = async (newStatus: PropertyStatus) => {
    await propertyRepository.updatePropertyStatus(property.id, newStatus);
  };
    const markAsPropertyHistoryStatus = async (newStatus: propertySelingStatus) => {
    await historyPropertyRepository.createHistoryProperty(
      ownerRole.id,
      property.id,
      propertySelingStatus,   // last = estado em que entrou neste fluxo
      newStatus,
    );
  };

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
    await markAsPropertyStatus("EM_ANALISE");
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

    const allFiles = Object.entries(files).flatMap(([fieldname, fieldFiles]) =>
      fieldFiles.map((file) => ({ fieldname, file })),
    );

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
    await markAsPropertyStatus("EM_ANALISE");
    throw new AppError(
      `Falha no upload de ${mediaErrors.length} ficheiro(s). Propriedade marcada como EM_ANALISE. Detalhes: ${mediaErrors.join(" | ")}`,
      500,
    );
  }

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
      await markAsPropertyStatus("EM_ANALISE");
      const message = locError instanceof Error ? locError.message : String(locError);
      throw new AppError(
        `Falha ao salvar localização. Propriedade marcada como EM_ANALISE. Detalhes: ${message}`,
        500,
      );
    }
  }

    await historyPropertyRepository.createHistoryProperty(
    ownerRole.id,
    property.id,
    "DISPONIVEL",
    "DISPONIVEL",
  );

  return uploaded;
  },
  findAll: async (limit: number, cursor: number) => {
    const properties = await propertyRepository.findAll(limit, cursor);
    const hasNextPage = properties.length > limit;
    const paginatedProperties = hasNextPage ? properties.slice(0, -1) : properties;
    const nextCursor = hasNextPage ? paginatedProperties[paginatedProperties.length - 1]!.id : null;

    return { properties: paginatedProperties, cursor: nextCursor };
  },
  findUserProperties: async (profileId: number, limit: number, cursor: number) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profileId, 2);
    if (!ownerRole) throw new AppError("Owner not found!", 404);
    
    const properties = await propertyRepository.findAllUserProperties(ownerRole.id, limit, cursor);
    const hasNextPage = properties.length > limit;
    const paginatedProperties = hasNextPage ? properties.slice(0, -1) : properties;
    const nextCursor = hasNextPage ? paginatedProperties[paginatedProperties.length - 1]!.id : null;

    return { properties: paginatedProperties, cursor: nextCursor };
  },
  publishProperty :async (profileId: number, propertyId: number) => {
    const owerRole = await profileRole.findProfileRoleByRole(profileId, 2);
    if(!owerRole) throw new AppError("Owner not found!", 404);
    const property = await propertyRepository.findUniqueUserProperty(owerRole.id, propertyId);
    if(!property) throw new AppError("Property not found!", 404);
    if(property.status_property === "PUBLICADO") throw new AppError("Property is already active!", 400);
  }
};

function deleteFromCloudinary(publicId: string): any {
  throw new Error("Function not implemented.");
}
