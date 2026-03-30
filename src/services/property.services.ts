import type { PropertyStatus, TypeProperties } from "../../generated/prisma/index.js";
import { AppError } from "../errors/App.Errors.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";

export const propertyService = {
    create: async(profile_id: number, title: string, type_of_property: TypeProperties, description: string,status_property: PropertyStatus, price: number, total_area: number) => {
        const verifyOwnerId = await profileRole.findProfileRoleByRole(profile_id, 2)

        if(!verifyOwnerId)
            throw new AppError('Owner Not found', 404)

    },
    findAll: async(limit: number, cursor: number)=> {
        return await propertyRepository.findAll()
    }
}