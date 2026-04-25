import { profile } from "node:console";
import { type properties, Property_purchase, PropertyStatus, propertySelingStatus, TypeProperties } from "../../../generated/prisma/index.js";
import { prisma } from "../../../lib/prisma.js";

export const propertyRepository = {
    createProperty: async(id_owner:number, title: string, type_property_purchase: Property_purchase, type_of_property: TypeProperties, description: string,status_property: PropertyStatus, seling_status: propertySelingStatus, price: number, total_area: number| undefined): Promise<properties> => {
        return prisma.properties.create({
            data: {
                id_owner,
                title,
                type_property_purchase,
                type_of_property,
                description,
                status_property,
                seling_status,
                price,
                total_area: total_area?total_area: null
            }
        })
    },
    findAll: async(limit: number, cursor: number):Promise<properties[]|[]>=>{
        return prisma.properties.findMany({
    take: limit + 1, // busca 1 a mais para saber se há próxima página
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // pula o próprio cursor
    }),
    orderBy: { id: 'asc' },
  })||[]
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
        })||[]
    },
    findUniqueUserProperty: async(id_owner: number, propertyId: number):Promise<properties|null>=>{
        return prisma.properties.findUnique({
            where: { id_owner, id: propertyId },
        })
    },
    updatePropertyStatus: async(propertyId: number, status_property: PropertyStatus):Promise<properties|null>=>{
        return prisma.properties.update({
            where: { id: propertyId },
            data: { status_property }
        })
    }
}