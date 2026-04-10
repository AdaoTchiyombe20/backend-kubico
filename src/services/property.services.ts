import type { PropertyStatus, TypeProperties } from "../../generated/prisma/index.js";
import { AppError } from "../errors/App.Errors.js";
import { deleteTempFile, uploadToCloudinary } from "../middlewares/multer.middleware.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";

export const propertyService = {
    createProperty: async(data: {profile_id: number, title: string, type_of_property: TypeProperties, description: string,status_property: PropertyStatus, price: number, total_area: number|undefined}, files: { [fieldName: string]: Express.Multer.File[] }) => {
        const verifyOwnerId = await profileRole.findProfileRoleByRole(data.profile_id, 2)
        if(!verifyOwnerId)
            throw new AppError('Owner Not found', 404)
        
        const ownerId = await profileRole.findProfileRoleByRole(data.profile_id, 2)
        if(!ownerId) throw new AppError("Owner not found!", 404)
        const property = await propertyRepository.createProperty(data.profile_id, data.title, data.type_of_property, data.description, data.status_property, data.price, data.total_area)
        
        const allFiles = Object.entries(files).flatMap(([fieldname, fieldFiles]) =>
    fieldFiles.map(file => ({ fieldname, file }))
    );
     const results = await Promise.allSettled(
    allFiles.map(async ({ fieldname, file }) => {
      try {
        const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";
        const result = await uploadToCloudinary(
          file.path,
          `properties/${property.id}/documents`,
          resourceType
        );
        return { fieldname, url: result.secure_url };
      } finally {
        await deleteTempFile(file.path);
      }
    })
  );

  const uploaded: Record<string, string> = {};
  for (const result of results) {
    if (result.status === "fulfilled") {
      uploaded[result.value.fieldname] = result.value.url;
    }
    // podes logar os "rejected" aqui se quiseres
  }
  return uploaded;

    },
    findAll: async(limit: number, cursor: number)=> {
        return await propertyRepository.findAll(limit, cursor)
    }
}