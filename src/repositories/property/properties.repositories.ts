import { type properties, Property_purchase, PropertyStatus, propertySelingStatus, TypeProperties, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const propertyRepository = {
    createProperty: async(id_owner:number, title: string, type_property_purchase: Property_purchase, type_of_property: TypeProperties, description: string,status_property: PropertyStatus, is_negotiable: boolean, price: number, total_area: number| undefined): Promise<properties> => {
        return prisma.properties.create({
            data: {
                id_owner,
                title,
                type_property_purchase,
                type_of_property,
                description,
                status_property,
                is_negotiable,
                price,
                total_area: total_area?total_area: null
            }
        })
    },
    findAll: async(limit: number, cursor: number):Promise<properties[]|[]>=>{
        return prisma.properties.findMany({
            take: limit + 1, 
            ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
            }),
            orderBy: { id: 'asc' },
            include: {
                    property_localization: true,
                    property_compartments: true,
                    property_medias: true,
                    property_listing: true,
                    property_history: true,
                }
        }) || []
    },
    findAllUserProperties: async(id_owner: number, limit: number, cursor: number):Promise<properties[]|[]>=>{
        return prisma.properties.findMany({
            where: { id_owner },
            take: limit + 1, 
            ...(cursor && {
            cursor: { id: cursor },
            skip: 1, 
            }),
            orderBy: { id: 'asc' },
            include: {
                    property_localization: true,
                    property_compartments: true,
                    property_medias: true,
                    property_listing: true,
                    property_history: true,
            }
        })||[]
    },
    findUniqueUserProperty: async(id_owner: number, propertyId: number):Promise<properties|null>=>{
        return prisma.properties.findUnique({
            where: { id_owner, id: propertyId },
            include: {
                    property_localization: true,
                    property_compartments: true,
                    property_medias: true,
                    property_listing: true,
                    property_history: true,
            }
        })
    },
    updatePropertyStatus: async(propertyId: number, status_property: PropertyStatus):Promise<properties|null>=>{
        return prisma.properties.update({
            where: { id: propertyId },
            data: { status_property }
        })
    },
    updatePropertyInfo: async(propertyId: number, data: {title: string | undefined, type_property_purchase: Property_purchase| undefined, type_of_property: TypeProperties|undefined, description: string|undefined, is_negotiable: boolean|undefined, price: number|undefined, total_area: number | undefined}): Promise<properties|null> => {
    const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
        ) as Prisma.propertiesUpdateInput;

    return prisma.properties.update({
        where: { id: propertyId },
        data: cleanData
    });
},
deleteProperty: async (propertyId: number): Promise<properties> => {
  return prisma.properties.delete({
    where: { id: propertyId },
  });
},
}
