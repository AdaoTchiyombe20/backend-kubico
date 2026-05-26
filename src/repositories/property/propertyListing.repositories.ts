import { prisma } from "../../../lib/prisma.js";
import { ListingStatus, type propertyListing } from "@prisma/client";
import type { ParsedSearchFilters  } from "../../dto/property.dto.js"; 

export const propertyListingRepository = {
  createListing: async (
    property_id: number,
    status: ListingStatus,
  ): Promise<propertyListing> => {
    return prisma.propertyListing.create({
      data: { property_id, status },
    });
  },

  findActiveListing: async (property_id: number): Promise<propertyListing | null> => {
    return prisma.propertyListing.findFirst({
      where: {
        property_id,
        delisted_at: null,
      },
      include: {
        property: {
          include: {
            property_medias: true,
            property_localization: true,
            property_compartments: true,
          },
        },
      },
    });
  },

  delistProperty: async (listingId: number): Promise<propertyListing> => {
    return prisma.propertyListing.update({
      where: { id: listingId },
      data: { delisted_at: new Date() },
    });
  },

  findAllListings: async (limit: number, cursor: number): Promise<propertyListing[]> => {
    return prisma.propertyListing.findMany({
      where: {
        delisted_at: null,
        status: ListingStatus.DISPONIVEL,
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property: {
          include: {
            property_medias: true,
            property_localization: true,
            property_compartments: true,
          },
        },
      },
      orderBy: { id: "desc" },
      take: limit + 1,
    });
  },

  findListingById: async (listingId: number): Promise<propertyListing | null> => {
    return await prisma.propertyListing.findFirst({
      where: {
        id: listingId,
        delisted_at: null,
      },
      include: {
        property: {
          include: {
            property_medias: true,
            property_localization: true,
            property_compartments: true,
          },
        },
      },
    });
  },

  findListingByProfileIdAndPropertyId: async ( propertyId: number): Promise<propertyListing | null> => {
    return await prisma.propertyListing.findFirst({
      where: {
        property_id: propertyId,
        delisted_at: null,
      },
      include: {
        property: {
          include: {
            property_medias: true,
            property_localization: true,
            property_compartments: true,
          },
        },
      },
    });
  },

  searchListings: async (
    filters: ParsedSearchFilters,
    limit: number,
    cursor: number,
  ): Promise<propertyListing[]> => {
    return prisma.propertyListing.findMany({
      where: {
        delisted_at: null,
        status: ListingStatus.DISPONIVEL,
        ...(cursor > 0 && { id: { gt: cursor } }),
        property: {
            ...(filters.type_of_property && {
              type_of_property: filters.type_of_property,
            }),

            ...(filters.type_purchase && {
              type_property_purchase: filters.type_purchase,
            }),

            ...(filters.is_negotiable !== undefined && {
              is_negotiable: filters.is_negotiable,
            }),

            ...(filters.min_price !== undefined ||
            filters.max_price !== undefined
              ? {
                  price: {
                    ...(filters.min_price !== undefined && {
                      gte: filters.min_price,
                    }),

                    ...(filters.max_price !== undefined && {
                      lte: filters.max_price,
                    }),
                  },
                }
              : {}),
          },
      },
      include: {
        property: {
          include: {
            property_medias: true,
            property_localization: true,
            property_compartments: true,
          },
        },
      },
      orderBy: { id: "asc" },
      take: limit + 1,
    });
  },
};