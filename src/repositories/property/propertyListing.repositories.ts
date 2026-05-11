import { prisma } from "../../../lib/prisma.js";
import { ListingStatus, type propertyListing } from "@prisma/client";

export const propertyListingRepository = {
  createListing: async (
    property_id: number,
    status: ListingStatus,
  ): Promise<propertyListing> => {
    return prisma.propertyListing.create({
      data: {
        property_id,
        status,
      },
    });
  },

  findActiveListing: async (property_id: number): Promise<propertyListing | null> => {
    return prisma.propertyListing.findFirst({
      where: {
        property_id,
        delisted_at: null,
      },
    });
  },

  delistProperty: async (listingId: number): Promise<propertyListing> => {
    return prisma.propertyListing.update({
      where: { id: listingId },
      data: {
        delisted_at: new Date(),
      },
    });
  },
};
