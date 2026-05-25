import { prisma } from "../../../lib/prisma.js";
import { PricingType, type platform_pricing, PricingNameDescription, PricingModel } from "@prisma/client";

export const platformPricingRepository = {

  createPricing: async (
    type: PricingType,
    name: PricingNameDescription,
    amount: number,
    pricing_model: PricingModel,
    admin_id: number
  ): Promise<platform_pricing> => {

    return prisma.platform_pricing.create({
      data: {
        type,
        name,
        amount,
        pricing_model,
        created_by: admin_id,
      }
    })
  },

  replacePricing: async (
    type: PricingType,
    name: PricingNameDescription,
    amount: number,
    pricing_model: PricingModel,
    admin_id: number
  ): Promise<platform_pricing> => {

    return prisma.$transaction(async(tx) => {

      await tx.platform_pricing.updateMany({
        where: {
          type,
          is_active: true
        },
        data: {
          is_active: false,
          updated_by: admin_id
        }
      })

      return tx.platform_pricing.create({
        data: {
          type,
          name,
          amount,
          pricing_model,
          created_by: admin_id
        }
      })
    })
  },

  findActivePricingByType: async (
    type: PricingType
  ): Promise<platform_pricing | null> => {

    return prisma.platform_pricing.findFirst({
      where: {
        type,
        is_active: true
      }
    })
  }
}