import type { payments, PaymentStatus, PropertyStatus, TypeProperties } from "@prisma/client";
import {AccessLevel, type admins } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export const adminRepository = { 
    createAdmin: async(user_id:number,adminsName:string, profile_role_id: number,accessLevel: AccessLevel): Promise<admins> => {
        return prisma.admins.create({
            data: {
                profile_role_id,
                user_id,
                adminsName,
                access_level: accessLevel,
                deleted_at: null
            }
        })
    }, 
    findAdmin: async(profile_role_id: number, user_id: number): Promise<admins|null>=>{
        return prisma.admins.findUnique({
            where: {user_id, profile_role_id}
        }) || null
    }
}



export const paymentAdminRepository = {

  findAllPayments: async (
    limit: number,
    cursor: number
  ): Promise<payments[]> => {
    return await prisma.payments.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                type_property_purchase: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findPaymentById: async (id: number): Promise<payments | null> => {
    return await prisma.payments.findUnique({
      where: { id },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                type_property_purchase: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        negociation: {
          select: {
            id: true,
            status: true,
            proposed_price: true,
          },
        },
      },
    });
  },

  findPaymentsByStatus: async (
    status: PaymentStatus,
    limit: number,
    cursor: number
  ): Promise<payments[]> => {
    return await prisma.payments.findMany({
      where: {
        status,
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findReceivedPayments: async (
    owner_id: number,
    limit: number,
    cursor: number
  ): Promise<payments[]> => {
    return await prisma.payments.findMany({
      where: {
        owner_id,
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findReleasedPayments: async (
    limit: number,
    cursor: number
  ): Promise<payments[]> => {
    return await prisma.payments.findMany({
      where: {
        status: "RELEASED",
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { released_at: "desc" },
      take: limit + 1,
    });
  },

  releasePayment: async (
    payment_id: number,
    released_by: number
  ): Promise<payments> => {
    return await prisma.payments.update({
      where: { id: payment_id },
      data: {
        status: "RELEASED",
        released_at: new Date(),
        released_by,
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  },
};

import type { negociation, properties, NegociationStatus, Property_purchase } from "@prisma/client";

export const negociationAdminRepository = {
  findAllNegociations: async (
    limit: number,
    cursor: number
  ): Promise<negociation[]> => {
    return await prisma.negociation.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                price: true,
                type_property_purchase: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        negociationEvents: {
          orderBy: { event_date: "desc" },
          take: 3,
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findNegociationById: async (id: number): Promise<negociation | null> => {
    return await prisma.negociation.findUnique({
      where: { id },
      include: {
        property_listing: {
          include: {
            property: {
              include: {
                property_medias: true,
                property_localization: true,
                property_compartments: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: true,
                company_profile: true,
              },
            },
            user: {
              select: {
                email: true,
                status: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: true,
                company_profile: true,
              },
            },
            user: {
              select: {
                email: true,
                status: true,
              },
            },
          },
        },
        negociationEvents: {
          include: {
            profile_roles: {
              select: {
                id: true,
                profile: {
                  include: {
                    person_profile: {
                      select: { full_name: true },
                    },
                    company_profile: {
                      select: { legal_name: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { event_date: "desc" },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });
  },

  findNegociationsByStatus: async (
    status: NegociationStatus,
    limit: number,
    cursor: number
  ): Promise<negociation[]> => {
    return await prisma.negociation.findMany({
      where: {
        status,
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_listing: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
        client: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        negociationEvents: {
          orderBy: { event_date: "desc" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },
};

export const propertyAdminRepository = {
  findAllProperties: async (
    limit: number,
    cursor: number
  ): Promise<properties[]> => {
    return await prisma.properties.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        property_localization: true,
        property_compartments: true,
        property_medias: true,
        property_listing: {
          select: {
            id: true,
            status: true,
            listed_at: true,
            delisted_at: true,
          },
        },
        property_history: {
          orderBy: { started_at: "desc" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findPropertyById: async (id: number): Promise<properties | null> => {
    return await prisma.properties.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            profile: {
              include: {
                person_profile: true,
                company_profile: true,
              },
            },
            user: {
              select: {
                email: true,
                status: true,
              },
            },
          },
        },
        property_localization: true,
        property_compartments: true,
        property_medias: {
          orderBy: { order: "asc" },
        },
        property_listing: true,
        property_history: {
          orderBy: { started_at: "desc" },
        },
        property_restrictions_history: {
          orderBy: { changed_at: "desc" },
        },
      },
    });
  },

  findPropertiesByStatus: async (
    status: PropertyStatus ,
    limit: number,
    cursor: number
  ): Promise<properties[]> => {
    return await prisma.properties.findMany({
      where: {
        status_property: status,
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        property_localization: true,
        property_compartments: true,
        property_medias: {
          take: 1,
        },
        property_listing: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findPropertiesByOwner: async (
    owner_id: number,
    limit: number,
    cursor: number
  ): Promise<properties[]> => {
    return await prisma.properties.findMany({
      where: {
        id_owner: owner_id,
        ...(cursor > 0 && { id: { gt: cursor } }),
      },
      include: {
        property_localization: true,
        property_compartments: true,
        property_medias: {
          take: 1,
        },
        property_listing: {
          select: {
            id: true,
            status: true,
          },
        },
        property_history: {
          orderBy: { started_at: "desc" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  searchProperties: async (
    filters: {
      type_of_property?: TypeProperties;
      type_property_purchase?: Property_purchase;
      status_property?: PropertyStatus;
      municipality?: string;
      neighborhood?: string;
      min_price?: number;
      max_price?: number;
    },
    limit: number,
    cursor: number
  ): Promise<properties[]> => {
    return await prisma.properties.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
        ...(filters.type_of_property && {
          type_of_property: { equals: filters.type_of_property },
        }),
        ...(filters.type_property_purchase && {
          type_property_purchase: { equals: filters.type_property_purchase },
        }),
        ...(filters.status_property && {
          status_property: { equals: filters.status_property },
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
        property_localization: {
          ...(filters.municipality && {
            municipality: filters.municipality,
          }),
          ...(filters.neighborhood && {
            neighborhood: filters.neighborhood,
          }),
        },
      },
      include: {
        owner: {
          include: {
            profile: {
              include: {
                person_profile: {
                  select: { full_name: true },
                },
                company_profile: {
                  select: { legal_name: true },
                },
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        property_localization: true,
        property_compartments: true,
        property_medias: {
          take: 1,
        },
        property_listing: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },
};

