import { type properties, Property_purchase, PropertyStatus, TypeProperties } from "../../../generated/prisma/index.js";
import { prisma } from "../../../lib/prisma.js";

export const propertyRepository = {
    createProperty: async(id_owner:number, title: string, type_property_purchase: Property_purchase, type_of_property: TypeProperties, description: string,status_property: PropertyStatus, price: number, total_area: number| undefined): Promise<properties> => {
        return prisma.properties.create({
            data: {
                id_owner,
                title,
                type_property_purchase,
                type_of_property,
                description,
                status_property,
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
    }
}
