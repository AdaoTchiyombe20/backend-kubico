import { is } from "zod/locales";
import type { CompartmentsTypes, ListingStatus, Property_purchase, PropertyStatus, propertySelingStatus, TypeProperties } from "../../generated/prisma/index.js";
import type { UpdatePropertyInfoDTO } from "../dto/property.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { deleteTempFile, uploadToCloudinary } from "../middlewares/multer.middleware.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { historyPropertyRepository } from "../repositories/property/historyProperty.respositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyCompartmentsRepository } from "../repositories/property/propertyCompartments.repositories.js";
import { propertyLocalizationRepository } from "../repositories/property/propertyLocalization.repositories.js";
import { propertyMediaRepository } from "../repositories/property/propertyMedia.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";
import cloudinary from "../config/cloudinary.js";
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

const deleteFromCloudinary = async (publicId: string, resourceType: "image" | "video" = "image"): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

const limiter = pLimit(3);

export const propertyService = {
  findAll: async (limit: number, cursor: number) => {
    const properties = await propertyRepository.findAll(limit, cursor);
    const hasNextPage = properties.length > limit;
    const paginatedProperties = hasNextPage ? properties.slice(0, -1) : properties;
    const nextCursor = hasNextPage
      ? paginatedProperties[paginatedProperties.length - 1]!.id
      : null;
    return { properties: paginatedProperties, cursor: nextCursor };
  },

  findUserProperties: async (profileId: number, limit: number, cursor: number) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profileId, 2);
    if (!ownerRole) throw new AppError("Owner not found!", 404);

    const properties = await propertyRepository.findAllUserProperties(ownerRole.id, limit, cursor);
    const hasNextPage = properties.length > limit;
    const paginatedProperties = hasNextPage ? properties.slice(0, -1) : properties;
    const nextCursor = hasNextPage
      ? paginatedProperties[paginatedProperties.length - 1]!.id
      : null;
    return { properties: paginatedProperties, cursor: nextCursor };
  },

  publishProperty: async (profileId: number, propertyId: number) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profileId, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, propertyId);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    if (property.status_property === "PUBLICADO")
      throw new AppError("Imóvel já está publicado!", 400);

    if (property.status_property === "EM_ANALISE")
      throw new AppError("Imóvel está em análise e não pode ser publicado!", 400);

    // Verifica se tem media e localização antes de publicar
    const medias = await propertyMediaRepository.findAllPropertyMedia(propertyId);
    if (medias.length === 0)
      throw new AppError("Imóvel precisa de pelo menos uma imagem para ser publicado!", 400);

    const localization = await propertyLocalizationRepository.findPropertyLocalization(propertyId);
    if (!localization)
      throw new AppError("Imóvel precisa de localização para ser publicado!", 400);

    await propertyRepository.updatePropertyStatus(propertyId, "PUBLICADO");

    await propertyListingRepository.createListing(propertyId, "DISPONIVEL");

    await historyPropertyRepository.createHistoryProperty(
      ownerRole.id,
      propertyId,
      "DISPONIVEL",
      "DISPONIVEL",
    );

    return { message: "Imóvel publicado com sucesso!" };
  },

  unpublishProperty: async (profileId: number, propertyId: number) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profileId, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, propertyId);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    if (property.status_property === "NAO_PUBLICADO")
      throw new AppError("Imóvel já está despublicado!", 400);

    if (property.status_property === "EM_ANALISE")
      throw new AppError("Imóvel está em análise!", 400);

    const activeListing = await propertyListingRepository.findActiveListing(propertyId);
    if (!activeListing) throw new AppError("Listagem activa não encontrada!", 404);

    await propertyListingRepository.delistProperty(activeListing.id);

    await propertyRepository.updatePropertyStatus(propertyId, "NAO_PUBLICADO");

    await historyPropertyRepository.createHistoryProperty(
      ownerRole.id,
      propertyId,
      "DISPONIVEL",
      "CANCELADO",
    );

    return { message: "Imóvel despublicado com sucesso!" };
  },

  deleteProperty: async (profileId: number, propertyId: number) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profileId, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, propertyId);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    // Apaga todas as medias do Cloudinary antes de apagar do DB
    const medias = await propertyMediaRepository.findAllPropertyMedia(propertyId);

    if (medias.length > 0) {
      await Promise.allSettled(
        medias.map((media) =>
          limiter(() =>
            deleteFromCloudinary(
              media.public_id,
              media.type === "VIDEO" ? "video" : "image",
            ),
          ),
        ),
      );
    }

    // O Cascade trata o resto (media, compartments, localization, listing, history)
    await propertyRepository.deleteProperty(propertyId);

    return { message: "Imóvel apagado com sucesso!" };
  },

  createProperty: async (
    data: {
      profile_id: number;
      title: string;
      type_purchase: Property_purchase;
      type_of_property: TypeProperties;
      description: string;
      price: number;
      is_negotiable: boolean;
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
      data.is_negotiable,
      data.price,
      data.total_area,
    );

    const markAsPropertyStatus = async (newStatus: PropertyStatus) => {
      await propertyRepository.updatePropertyStatus(property.id, newStatus);
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
      await markAsPropertyStatus("EM_ANALISE");
      const reasons = compartmentErrors
        .map((r) => (r.status === "rejected" ? (r.reason instanceof Error ? r.reason.message : String(r.reason)) : ""))
        .join(" | ");
      throw new AppError(`Falha ao salvar ${compartmentErrors.length} compartimento(s). Propriedade marcada como EM_ANALISE. Detalhes: ${reasons}`, 500);
    }

    const allFiles = Object.entries(files).flatMap(([fieldname, fieldFiles]) =>
      fieldFiles.map((file) => ({ fieldname, file })),
    );

    const orphanedCloudinaryIds: string[] = [];

    const results = await Promise.allSettled(
      allFiles.map(({ fieldname, file }) =>
        limiter(async () => {
          try {
            const resourceType = resolveResourceType(file.mimetype);
            const mediaType = resolveMediaType(file.mimetype);

            const result = await uploadToCloudinary(file.path, `properties/${property.id}`, resourceType);

            try {
              await propertyMediaRepository.createPropertyMedia(
                property.id,
                result.secure_url,
                mediaType,
                result.public_id,
                0,
              );
            } catch (dbError) {
              orphanedCloudinaryIds.push(result.public_id);
              const message = dbError instanceof Error ? dbError.message : String(dbError);
              throw new AppError(`Upload OK mas falha ao registar no DB para "${fieldname}": ${message}`, 500);
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
        const message = result.reason instanceof AppError ? result.reason.message : String(result.reason);
        mediaErrors.push(message);
      }
    }

    if (mediaErrors.length > 0) {
      await markAsPropertyStatus("EM_ANALISE");
      throw new AppError(`Falha no upload de ${mediaErrors.length} ficheiro(s). Propriedade marcada como EM_ANALISE. Detalhes: ${mediaErrors.join(" | ")}`, 500);
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
        await markAsPropertyStatus("EM_ANALISE");
        const message = locError instanceof Error ? locError.message : String(locError);
        throw new AppError(`Falha ao salvar localização. Propriedade marcada como EM_ANALISE. Detalhes: ${message}`, 500);
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

  updatePropertyInfo: async (profile_id: number, property_id: number, data: UpdatePropertyInfoDTO) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const { title, type_purchase, type_of_property, description, price, total_area, is_negotiable, address_info, neighborhood, municipality, compartments } = data;

    const updatedProperty = await propertyRepository.updatePropertyInfo(property_id, {
      title,
      type_property_purchase: type_purchase,
      type_of_property,
      description,
      is_negotiable,
      price,
      total_area,
    });
    if (!updatedProperty) throw new AppError("Falha ao actualizar imóvel!", 500);

    if (address_info || neighborhood || municipality) {
      await propertyLocalizationRepository.updatePropertyLocalization(property_id, {
        address_info,
        neighborhood,
        municipality,
      });
    }

    if (compartments && compartments.length > 0) {
      const updateCompartments = await Promise.allSettled(
        compartments.map((compartment) =>
          propertyCompartmentsRepository.updatePropertyCompartments(property_id, {
            type: compartment.type.toUpperCase() as CompartmentsTypes,
            quantity: compartment.quantity,
          }),
        ),
      );

      if (updateCompartments.some((r) => r.status === "rejected")) {
        await propertyRepository.updatePropertyStatus(property_id, "EM_ANALISE");
        throw new AppError("Falha ao actualizar compartimentos. Imóvel marcado como EM_ANALISE.", 500);
      }
    }

    return updatedProperty;
  },

  updatePropertyMedia: async (
    profile_id: number,
    property_id: number,
    mediaId: number,
    file: Express.Multer.File,
  ) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const existingMedia = await propertyMediaRepository.findPropertyMediaById(mediaId, property_id);
    if (!existingMedia) throw new AppError("Media não encontrada!", 404);

    // 1. Apaga do Cloudinary primeiro
    const resourceType = existingMedia.type === "VIDEO" ? "video" : "image";
    await deleteFromCloudinary(existingMedia.public_id, resourceType);

    // 2. Upload do novo ficheiro
    let uploadResult;
    try {
      const newResourceType = resolveResourceType(file.mimetype);
      uploadResult = await uploadToCloudinary(
        file.path,
        `properties/${property_id}`,
        newResourceType,
      );
    } finally {
      await deleteTempFile(file.path);
    }

    // 3. Actualiza o registo no DB
    const newMediaType = resolveMediaType(file.mimetype);
    const updated = await propertyMediaRepository.updatePropertyMedia(
      mediaId,
      uploadResult.secure_url,
      newMediaType,
      uploadResult.public_id,
    );

    return updated;
  },

  deletePropertyMedia: async (
    profile_id: number,
    property_id: number,
    mediaId: number,
  ) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const existingMedia = await propertyMediaRepository.findPropertyMediaById(mediaId, property_id);
    if (!existingMedia) throw new AppError("Media não encontrada!", 404);

    // Garante que o imóvel fica com pelo menos 1 media
    const allMedias = await propertyMediaRepository.findAllPropertyMedia(property_id);
    if (allMedias.length <= 1)
      throw new AppError("O imóvel precisa de pelo menos uma imagem. Adicione outra antes de remover esta.", 400);

    const resourceType = existingMedia.type === "VIDEO" ? "video" : "image";
    await deleteFromCloudinary(existingMedia.public_id, resourceType);

    await propertyMediaRepository.deletePropertyMedia(mediaId);

    return { message: "Media removida com sucesso!" };
  },

  addPropertyMedia: async (
    profile_id: number,
    property_id: number,
    file: Express.Multer.File,
  ) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const resourceType = resolveResourceType(file.mimetype);
    const mediaType = resolveMediaType(file.mimetype);

    // Limita a 1 vídeo por imóvel
    if (mediaType === "VIDEO") {
      const existingVideos = await propertyMediaRepository.findPropertyMediaByType(property_id, "VIDEO");
      if (existingVideos.length >= 1)
        throw new AppError("Já existe um vídeo para este imóvel. Substitua o existente.", 400);
    }

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(file.path, `properties/${property_id}`, resourceType);
    } finally {
      await deleteTempFile(file.path);
    }

    const allMedias = await propertyMediaRepository.findAllPropertyMedia(property_id);
    const nextOrder = allMedias.length > 0 ? Math.max(...allMedias.map((m) => m.order)) + 1 : 0;

    const media = await propertyMediaRepository.createPropertyMedia(
      property_id,
      uploadResult.secure_url,
      mediaType,
      uploadResult.public_id,
      nextOrder,
    );

    return media;
  },
};