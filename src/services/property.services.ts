import { type properties } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type {
  CompartmentsTypes,
  ListingStatus,
  Property_purchase,
  PropertyStatus,
  propertySelingStatus,
  TypeProperties,
} from "@prisma/client";
import { parseTypeProperties, parsePropertyPurchase } from "../utils/enumValidators.js";
import type { UpdatePropertyInfoDTO } from "../dto/property.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { deleteTempFile } from "../middlewares/multer.middleware.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { historyPropertyRepository } from "../repositories/property/historyProperty.respositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyCompartmentsRepository } from "../repositories/property/propertyCompartments.repositories.js";
import { propertyLocalizationRepository } from "../repositories/property/propertyLocalization.repositories.js";
import { propertyMediaRepository } from "../repositories/property/propertyMedia.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";
import type { RawSearchFilters, ParsedSearchFilters } from "../dto/property.dto.js";
import pLimit from "p-limit";

// ✅ IMPORT dos utilitários de Cloudinary (centralizados)
import {
  uploadFilesToCloudinary,
  cleanupCloudinaryFiles,
  deleteTempFiles,
  resolveResourceType,
  resolveMediaType,
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.utils.js";
import { favPropertyRepository } from "../repositories/property/favProperty.repositories.js";

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
      "DISPONIVEL"
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
      "CANCELADO"
    );

    return { message: "Imóvel despublicado com sucesso!" };
  },

  findAllListings: async (limit: number, cursor: number) => {
    try {
      const listings = await propertyListingRepository.findAllListings(limit, cursor);
      const hasNextPage = listings.length > limit;
      const paginated = hasNextPage ? listings.slice(0, -1) : listings;
      return {
        properties: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]!.id : null,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erro ao buscar listagens: " + (error instanceof Error ? error.message : String(error)),
        500
      );
    }
  },

  findListingById: async (property_id: number) => {
    try {
      const listingId = await propertyRepository.findUniquePropertyById(property_id);
      if(!listingId) throw new AppError("Imóvel não encontrado!", 404);
      const listing = await propertyListingRepository.findListingById(listingId.id);
      if (!listing) throw new AppError("Listagem não encontrada!", 404);
      return listing;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erro ao buscar listagem: " + (error instanceof Error ? error.message : String(error)),
        500
      );
    }
  },

  searchListings: async (filters: RawSearchFilters, limit: number, cursor: number) => {
    try {
      const parsedFilters: ParsedSearchFilters = {
        type_of_property: filters.type_of_property
          ? parseTypeProperties(filters.type_of_property)
          : undefined,
        type_purchase: filters.type_purchase
          ? parsePropertyPurchase(filters.type_purchase)
          : undefined,
        neighborhood: filters.neighborhood?.trim(),
        municipality: filters.municipality?.trim(),
        min_price: filters.min_price !== undefined ? Number(filters.min_price) : undefined,
        max_price: filters.max_price !== undefined ? Number(filters.max_price) : undefined,
      };

      // Validation
      if (parsedFilters.min_price !== undefined && isNaN(parsedFilters.min_price))
        throw new AppError("Preço mínimo inválido!", 400);

      if (parsedFilters.max_price !== undefined && isNaN(parsedFilters.max_price))
        throw new AppError("Preço máximo inválido!", 400);

      if (
        parsedFilters.min_price !== undefined &&
        parsedFilters.max_price !== undefined &&
        parsedFilters.min_price > parsedFilters.max_price
      )
        throw new AppError("Preço mínimo não pode ser maior que o preço máximo!", 400);

      const listings = await propertyListingRepository.searchListings(
        parsedFilters,
        limit,
        cursor
      );
      const hasNextPage = listings.length > limit;
      const paginated = hasNextPage ? listings.slice(0, -1) : listings;

      return {
        properties: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]!.id : null,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erro ao buscar listagens: " + (error instanceof Error ? error.message : String(error)),
        500
      );
    }
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ✅ CREATE PROPERTY - SOLUÇÃO CORRIGIDA
  // ════════════════════════════════════════════════════════════════════════════
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
      latitude: number | null;
      longitude: number | null;
    },
    files: { [fieldName: string]: Express.Multer.File[] }
  ) => {
    // ✅ PASSO 0: Validações iniciais
    if (files.images === undefined || files.images.length === 0) {
      throw new AppError("Pelo menos uma imagem é obrigatória!", 400);
    }

    const status_property = "NAO_PUBLICADO" as PropertyStatus;
    const ownerRole = await profileRole.findProfileRoleByRole(data.profile_id, 2);
    if (!ownerRole) throw new AppError("Owner not found!", 404);

    // ✅ PASSO 1: Upload para Cloudinary ANTES de qualquer DB operation
    let uploadResults;

    try {
      uploadResults = await uploadFilesToCloudinary(files, "properties");
    } finally {
      console.log("Upload results:", uploadResults);
    }

    // Se houve erros no upload, limpar Cloudinary e falhar
    if (uploadResults.errors.length > 0) {
      await cleanupCloudinaryFiles(uploadResults.uploadedFiles);
      throw new AppError(
        `Falha no upload de ${uploadResults.errors.length} ficheiro(s): ${uploadResults.errors.join(" | ")}`,
        500
      );
    }

    // ✅ PASSO 2: UMA TRANSAÇÃO que cria TUDO
    let property: properties;
    try {
      property = await prisma.$transaction(async (tx) => {
        // Criar propriedade
        const newProperty = await tx.properties.create({
          data: {
            id_owner: ownerRole.id,
            title: data.title,
            type_property_purchase: data.type_purchase,
            type_of_property: data.type_of_property,
            description: data.description,
            status_property,
            is_negotiable: data.is_negotiable,
            price: data.price,
            total_area: data.total_area || null,
          },
        });

        // Criar compartimentos (SEM DUPLICAÇÃO)
        if (data.compartments.length > 0) {
          await Promise.all(
            data.compartments.map((compartment) =>
              tx.propertyCompartments.create({
                data: {
                  property_id: newProperty.id,
                  type: compartment.type.toUpperCase() as CompartmentsTypes,
                  quantity: compartment.quantity,
                },
              })
            )
          );
        }

        // Criar localização (SEM DUPLICAÇÃO)
        await tx.propertyLocalization.create({
          data: {
            property_id: newProperty.id,
            latitude: data.latitude,
            longitude: data.longitude,
            address_info: data.address_info,
            neighborhood: data.neighborhood,
            municipality: data.municipality,
          },
        });

        // Criar histórico (SEM DUPLICAÇÃO)
        await tx.propertyHistory.create({
          data: {
            id_owner: ownerRole.id,
            id_property: newProperty.id,
            last_status: "DISPONIVEL" as propertySelingStatus,
            new_status: "DISPONIVEL" as propertySelingStatus,
          },
        });

        // ✅ REGISTAR MEDIA FILES DENTRO DA TRANSAÇÃO!
        // Isto é CRÍTICO - se falhar aqui, tudo é revertido
        if (uploadResults.uploadedFiles.length > 0) {
          await Promise.all(
            uploadResults.uploadedFiles.map((media) =>
              tx.propertyMedia.create({
                data: {
                  property_id: newProperty.id,
                  url: media.url,
                  type: media.mediaType,
                  public_id: media.public_id,
                  order: 0,
                },
              })
            )
          );
        }

        return newProperty;
      });
    } catch (error) {
      // ✅ Se algo falhar na transação, limpar TODOS os uploads do Cloudinary
      await cleanupCloudinaryFiles(uploadResults.uploadedFiles);

      if (error instanceof AppError) throw error;
      throw new AppError(
        "Falha ao criar propriedade: " + (error instanceof Error ? error.message : String(error)),
        500
      );
    }

    // ✅ PASSO 3: Preparar resposta com URLs dos ficheiros
    const uploaded: Record<string, string> = {};
    uploadResults.uploadedFiles.forEach((media) => {
      if (!uploaded[media.fieldname]) {
        uploaded[media.fieldname] = media.url;
      }
    });

    return {property, uploaded};
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
              media.type === "VIDEO" ? "video" : "image"
            )
          )
        )
      );
    }

    // O Cascade trata o resto (media, compartments, localization, listing, history)
    await propertyRepository.deleteProperty(propertyId);

    return { message: "Imóvel apagado com sucesso!" };
  },

  updatePropertyInfo: async (
    profile_id: number,
    property_id: number,
    data: UpdatePropertyInfoDTO
  ) => {
    if (Object.values(data).every((v) => v === undefined || v === null)) {
      throw new AppError("Nenhum dado fornecido para atualização!", 400);
    }
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const {
      title,
      type_purchase,
      type_of_property,
      description,
      price,
      total_area,
      is_negotiable,
      address_info,
      neighborhood,
      municipality,
      compartments,
      latitude,
      longitude,
    } = data;

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

    if (address_info || neighborhood || municipality || latitude || longitude) {
      await propertyLocalizationRepository.updatePropertyLocalization(property_id, {
        address_info,
        neighborhood,
        municipality,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      });
    }

    if (compartments && compartments.length > 0) {
      const existingCompartments =
        await propertyCompartmentsRepository.findPropertyCompartments(property_id);

      const updateResults = await Promise.allSettled(
        compartments.map(async (newCompartment, index) => {
          const existingId = existingCompartments.find(
            (c) => c.type === newCompartment.type.toUpperCase()
          );

          if (!existingId) {
            // Se não existe, criar novo
            return await propertyCompartmentsRepository.createPropertyCompartments(
              property_id,
              newCompartment.type.toUpperCase() as CompartmentsTypes,
              newCompartment.quantity
            );
          }

          // Atualizar existente com ID correto
          return await propertyCompartmentsRepository.updatePropertyCompartments(existingId.id, {
            type: newCompartment.type.toUpperCase() as CompartmentsTypes,
            quantity: newCompartment.quantity,
          });
        })
      );

      const failedUpdates = updateResults.filter((r) => r.status === "rejected");
      if (failedUpdates.length > 0) {
        await propertyRepository.updatePropertyStatus(property_id, "EM_ANALISE");
        throw new AppError(
          "Falha ao actualizar compartimentos. Imóvel marcado como EM_ANALISE.",
          500
        );
      }
    }

    return updatedProperty;
  },

  updatePropertyMedia: async (
    profile_id: number,
    property_id: number,
    mediaId: number,
    file: Express.Multer.File
  ) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const existingMedia = await propertyMediaRepository.findPropertyMediaById(
      mediaId,
      property_id
    );
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
        newResourceType
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
      uploadResult.public_id
    );

    return updated;
  },

  deletePropertyMedia: async (
    profile_id: number,
    property_id: number,
    mediaId: number
  ) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const existingMedia = await propertyMediaRepository.findPropertyMediaById(
      mediaId,
      property_id
    );
    if (!existingMedia) throw new AppError("Media não encontrada!", 404);

    // Garante que o imóvel fica com pelo menos 1 media
    const allMedias = await propertyMediaRepository.findAllPropertyMedia(property_id);
    if (allMedias.length <= 1)
      throw new AppError(
        "O imóvel precisa de pelo menos uma imagem. Adicione outra antes de remover esta.",
        400
      );

    const resourceType = existingMedia.type === "VIDEO" ? "video" : "image";
    await deleteFromCloudinary(existingMedia.public_id, resourceType);

    await propertyMediaRepository.deletePropertyMedia(mediaId);

    return { message: "Media removida com sucesso!" };
  },

  addPropertyMedia: async (
    profile_id: number,
    property_id: number,
    file: Express.Multer.File
  ) => {
    const ownerRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!ownerRole) throw new AppError("Owner não encontrado!", 404);

    const property = await propertyRepository.findUniqueUserProperty(ownerRole.id, property_id);
    if (!property) throw new AppError("Imóvel não encontrado!", 404);

    const resourceType = resolveResourceType(file.mimetype);
    const mediaType = resolveMediaType(file.mimetype);

    // Limita a 1 vídeo por imóvel
    if (mediaType === "VIDEO") {
      const existingVideos = await propertyMediaRepository.findPropertyMediaByType(
        property_id,
        "VIDEO"
      );
      if (existingVideos.length >= 1)
        throw new AppError(
          "Já existe um vídeo para este imóvel. Substitua o existente.",
          400
        );
    }

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        file.path,
        `properties/${property_id}`,
        resourceType
      );
    } finally {
      await deleteTempFile(file.path);
    }

    const media = await propertyMediaRepository.createPropertyMediaWithNextOrder(
      property_id,
      uploadResult.secure_url,
      mediaType,
      uploadResult.public_id
    );

    return media;
  },
 addToFavorites: async (ownerId: number, propertyId: number) => {
  const findOwner = await profileRole.findProfileRoleByRole(ownerId, 2);
  console.log("findOwner:", findOwner);

  const findProperty = await propertyRepository.findUniquePropertyById(propertyId);
  console.log("findProperty:", findProperty);

  if (!findProperty) throw new AppError("Imóvel não encontrado!", 404);

  // Só compara se findOwner existir
  if (findOwner && findProperty.id_owner === findOwner.id) {
    throw new AppError("Não é possível favoritar seu próprio imóvel!", 400);
  }

  const findListedProperty = await propertyListingRepository.findActiveListing(propertyId);
  if(!findListedProperty) throw new AppError("Imóvel precisa estar publicado para ser adicionado aos favoritos!", 400);

  console.log("Antes de adicionar aos favoritos passou");

  await favPropertyRepository.addFavorite(ownerId, findListedProperty.id);
  console.log("Depois de adicionar aos favoritos passou");

  return { message: "Imóvel adicionado aos favoritos!" };
},
  removeFromFavorites: async (ownerId: number, propertyId: number) => {
    const findOwner = await profileRole.findProfileRoleByRole(ownerId, 2);
    if (!findOwner) throw new AppError("Owner não encontrado!", 404);
    const findProperty = await propertyRepository.findUniquePropertyById(propertyId);
    if (!findProperty) throw new AppError("Imóvel não encontrado!", 404);

    if(findProperty.id_owner === findOwner.id) throw new AppError("Não é possível adicionar ou remover dos favoritos seu próprio imóvel!", 400);

    await favPropertyRepository.removeFavorite(ownerId, propertyId);

    return { message: "Imóvel removido dos favoritos!" };
  },
  getUserFavorites: async (ownerId: number, limit: number, cursor: number) => {
    if(!limit)
      limit = 10;
    if(!cursor)
      cursor = 0;

    const findOwner = await profileRole.findProfileRoleByRole(ownerId, 2);
    if (!findOwner) throw new AppError("Owner não encontrado!", 404);

    const favorites = await favPropertyRepository.findUserFavorites(ownerId, limit, cursor);
    const hasNextPage = favorites.length > limit;
    const paginated = hasNextPage ? favorites.slice(0, -1) : favorites;
    return {
       properties: paginated,
       cursor: hasNextPage ? paginated[paginated.length - 1]!.id : null,
    };
  }
};

