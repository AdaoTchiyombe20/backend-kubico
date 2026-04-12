import type { CompartmentsTypes, PropertyStatus, TypeProperties } from "../../generated/prisma/index.js";
import { AppError } from "../errors/App.Errors.js";
import { deleteTempFile, uploadToCloudinary } from "../middlewares/multer.middleware.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { historyPropertyRepository } from "../repositories/property/historyProperty.respositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyCompartmentsRepository } from "../repositories/property/propertyCompartments.repositories.js";
import { propertyLocalizationRepository } from "../repositories/property/propertyLocalization.repositories.js";
import { propertyMediaRepository } from "../repositories/property/propertyMedia.repositories.js";
import pLimit from "p-limit";

// Tipos de media reconhecidos pelo repositório
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
      type_of_property: TypeProperties;
      description: string;
      status_property: PropertyStatus;
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
    data.status_property = "INATIVO";
    const ownerRole = await profileRole.findProfileRoleByRole(data.profile_id, 2);
    if (!ownerRole) throw new AppError("Owner not found!", 404);

    const property = await propertyRepository.createProperty(
      data.profile_id,
      data.title,
      data.type_of_property,
      data.description,
      data.status_property,
      data.price,
      data.total_area,
    );
    console.log("Propriedade criada com ID:", property.id);

    await Promise.allSettled(
            data.compartments.map(async (compartment) => {
              await propertyCompartmentsRepository.createPropertyCompartments(
                property.id,
                compartment.type.toUpperCase() as CompartmentsTypes,
                compartment.quantity,
              );
            })
          )

    const allFiles = Object.entries(files).flatMap(([fieldname, fieldFiles]) =>
      fieldFiles.map((file) => ({ fieldname, file })),
    );
    const results = await Promise.allSettled(
      allFiles.map(async ({ fieldname, file }) => limit(async () => {
        
        try {
          
          const resourceType = resolveResourceType(file.mimetype);
          const mediaType = resolveMediaType(file.mimetype);

          const result = await uploadToCloudinary(
            file.path,
            `properties/${property.id}/documents`,
            resourceType,
          );

          console.log(`Upload bem-sucedido para "${fieldname}":`, result);

          await propertyMediaRepository.createPropertyMedia(
            property.id,
            result.secure_url,
            mediaType,
            result.public_id,
            0,
          );

          return { fieldname, url: result.secure_url, public_id: result.public_id };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new AppError(`Erro ao enviar "${fieldname}": ${message}`, 500);
        } finally {
          await deleteTempFile(file.path);
        }
      }),
    ));

    if(data.latitude && data.longitude){
      await propertyLocalizationRepository.createPropertyLocalization(
            property.id,
            data.latitude,
            data.longitude,
            data.address_info,
            data.neighborhood,
            data.municipality
          );
    }

    await historyPropertyRepository.createHistoryProperty(
            ownerRole.id, 
            property.id,
            "INATIVO",
            "INATIVO",
          );

    const uploaded: Record<string, string> = {};
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        uploaded[result.value.fieldname] = result.value.url;
      } else {
        const message = result.reason instanceof AppError
          ? result.reason.message
          : String(result.reason);
        errors.push(message);
      }
    }
    if (errors.length > 0) {
      throw new AppError(`Falha no upload de ${errors.length} ficheiro(s): ${errors.join(" | ")}`, 500);
    }
    return uploaded;
  },

  findAll: async (limit: number, cursor: number) => {
    return await propertyRepository.findAll(limit, cursor);
  },
};