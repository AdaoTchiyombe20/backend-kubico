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

