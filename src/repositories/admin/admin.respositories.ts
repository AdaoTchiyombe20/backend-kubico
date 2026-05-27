import {
  AccessLevel,
  type admins,
  type NegociationStatus,
  type PaymentStatus,
  type PaymentType,
  type Prisma,
  type ProfileRoles,
  type ProfileType,
  type Property_purchase,
  type PropertyStatus,
  type TypeProperties,
  type UserRoleStatus,
  type UserStatus,
} from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

type PropertyAdminFilters = {
  type_of_property?: TypeProperties;
  type_property_purchase?: Property_purchase;
  status_property?: PropertyStatus;
  listing_status?: string;
  owner_id?: number;
  is_negotiable?: boolean;
  municipality?: string;
  neighborhood?: string;
  min_price?: number;
  max_price?: number;
};

export const adminRepository = {
  createAdmin: async (
    user_id: number,
    adminsName: string,
    profile_role_id: number,
    accessLevel: AccessLevel,
  ): Promise<admins> => {
    return prisma.admins.create({
      data: {
        profile_role_id,
        user_id,
        adminsName,
        access_level: accessLevel,
        deleted_at: null,
      },
    });
  },

  findAdmin: async (
    profile_role_id: number,
    user_id: number,
  ): Promise<admins | null> => {
    return prisma.admins.findUnique({
      where: { user_id, profile_role_id },
    });
  },
};

const profileIdentityInclude = {
  profile: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          email_verified: true,
          date_register: true,
          last_access: true,
        },
      },
      person_profile: {
        select: { full_name: true, birth_date: true },
      },
      company_profile: {
        select: { legal_name: true },
      },
    },
  },
  role: {
    select: {
      role: true,
      description: true,
    },
  },
} satisfies Prisma.profile_rolesInclude;

const paymentInclude = {
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
    include: profileIdentityInclude,
  },
  owner: {
    include: profileIdentityInclude,
  },
  negociation: {
    select: {
      id: true,
      status: true,
      proposed_price: true,
      accepted_value: true,
    },
  },
} satisfies Prisma.paymentsInclude;

const negociationInclude = {
  property_listing: {
    include: {
      property: {
        select: {
          id: true,
          title: true,
          price: true,
          type_property_purchase: true,
          is_negotiable: true,
        },
      },
    },
  },
  client: {
    include: profileIdentityInclude,
  },
  owner: {
    include: profileIdentityInclude,
  },
  negociationEvents: {
    orderBy: { event_date: "desc" as const },
    take: 3,
    include: {
      profile_roles: {
        include: profileIdentityInclude,
      },
    },
  },
  payments: {
    select: {
      id: true,
      status: true,
      amount: true,
      released_amount: true,
      platform_fee: true,
      created_at: true,
    },
  },
} satisfies Prisma.negociationInclude;

const propertyInclude = {
  owner: {
    include: profileIdentityInclude,
  },
  property_localization: true,
  property_compartments: true,
  property_medias: {
    orderBy: { order: "asc" as const },
  },
  property_listing: {
    select: {
      id: true,
      status: true,
      listed_at: true,
      delisted_at: true,
    },
  },
  property_history: {
    orderBy: { started_at: "desc" as const },
    take: 1,
  },
  property_restrictions_history: {
    orderBy: { changed_at: "desc" as const },
    take: 1,
  },
} satisfies Prisma.propertiesInclude;

export const userAdminRepository = {
  findUsers: async (
    filters: {
      status?: UserStatus | undefined;
      role?: ProfileRoles | undefined;
      role_status?: UserRoleStatus | undefined;
      type?: ProfileType | undefined;
      email?: string | undefined;
      name?: string | undefined;
    },
    limit: number,
    cursor: number,
  ) => {
    return prisma.profiles.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
        ...(filters.type && { type: filters.type }),
        user: {
          ...(filters.status && { status: filters.status }),
          ...(filters.email && {
            email: { contains: filters.email, mode: "insensitive" },
          }),
        },
        ...(filters.role || filters.role_status
          ? {
              user_role: {
                some: {
                  ...(filters.role_status && { status: filters.role_status }),
                  ...(filters.role && { role: { role: filters.role } }),
                },
              },
            }
          : {}),
        ...(filters.name
          ? {
              OR: [
                {
                  person_profile: {
                    full_name: { contains: filters.name, mode: "insensitive" },
                  },
                },
                {
                  company_profile: {
                    legal_name: { contains: filters.name, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            email_verified: true,
            date_register: true,
            last_access: true,
          },
        },
        person_profile: true,
        company_profile: true,
        user_role: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { id: "asc" },
      take: limit + 1,
    });
  },

  findUserById: async (id: number) => {
    return prisma.profiles.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            email_verified: true,
            date_register: true,
            last_access: true,
          },
        },
        person_profile: true,
        company_profile: true,
        user_role: {
          include: {
            role: true,
          },
        },
        userMidia: true,
      },
    });
  },
};

export const paymentAdminRepository = {
  findPayments: async (
    filters: {
      status?: PaymentStatus | undefined;
      payment_type?: PaymentType | undefined;
      owner_id?: number | undefined;
      client_id?: number | undefined;
      property_listing_id?: number | undefined;
    },
    limit: number,
    cursor: number,
  ) => {
    return prisma.payments.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
        ...(filters.status && { status: filters.status }),
        ...(filters.payment_type && { payment_type: filters.payment_type }),
        ...(filters.owner_id && { owner_id: filters.owner_id }),
        ...(filters.client_id && { client_id: filters.client_id }),
        ...(filters.property_listing_id && {
          property_listing_id: filters.property_listing_id,
        }),
      },
      include: paymentInclude,
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findAllPayments: async (limit: number, cursor: number) => {
    return paymentAdminRepository.findPayments({}, limit, cursor);
  },

  findPaymentById: async (id: number) => {
    return prisma.payments.findUnique({
      where: { id },
      include: paymentInclude,
    });
  },

  findPaymentsByStatus: async (
    status: PaymentStatus,
    limit: number,
    cursor: number,
  ) => {
    return paymentAdminRepository.findPayments({ status }, limit, cursor);
  },

  findReceivedPayments: async (
    owner_id: number,
    limit: number,
    cursor: number,
  ) => {
    return paymentAdminRepository.findPayments({ owner_id }, limit, cursor);
  },

  findReleasedPayments: async (limit: number, cursor: number) => {
    return paymentAdminRepository.findPayments(
      { status: "RELEASED" },
      limit,
      cursor,
    );
  },

  releasePayment: async (payment_id: number, released_by: number) => {
    return prisma.payments.update({
      where: { id: payment_id },
      data: {
        status: "RELEASED",
        released_at: new Date(),
        released_by,
        updated_at: new Date(),
      },
      include: paymentInclude,
    });
  },
};

export const negociationAdminRepository = {
  findNegociations: async (
    filters: {
      status?: NegociationStatus | undefined;
      payment_status?: PaymentStatus | undefined;
      owner_id?: number | undefined;
      client_id?: number | undefined;
      property_listing_id?: number | undefined;
    },
    limit: number,
    cursor: number,
  ) => {
    return prisma.negociation.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
        ...(filters.status && { status: filters.status }),
        ...(filters.owner_id && { owner_id: filters.owner_id }),
        ...(filters.client_id && { client_id: filters.client_id }),
        ...(filters.property_listing_id && {
          property_listing_id: filters.property_listing_id,
        }),
        ...(filters.payment_status && {
          payments: { status: filters.payment_status },
        }),
      },
      include: negociationInclude,
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findAllNegociations: async (limit: number, cursor: number) => {
    return negociationAdminRepository.findNegociations({}, limit, cursor);
  },

  findNegociationById: async (id: number) => {
    return prisma.negociation.findUnique({
      where: { id },
      include: negociationInclude,
    });
  },

  findNegociationsByStatus: async (
    status: NegociationStatus,
    limit: number,
    cursor: number,
  ) => {
    return negociationAdminRepository.findNegociations(
      { status },
      limit,
      cursor,
    );
  },
};

export const propertyAdminRepository = {
  findProperties: async (
    filters: PropertyAdminFilters,
    limit: number,
    cursor: number,
  ) => {
    return prisma.properties.findMany({
      where: {
        ...(cursor > 0 && { id: { gt: cursor } }),
        ...(filters.owner_id && { id_owner: filters.owner_id }),
        ...(filters.type_of_property && {
          type_of_property: filters.type_of_property,
        }),
        ...(filters.type_property_purchase && {
          type_property_purchase: filters.type_property_purchase,
        }),
        ...(filters.status_property && {
          status_property: filters.status_property,
        }),
        ...(filters.is_negotiable !== undefined && {
          is_negotiable: filters.is_negotiable,
        }),
        ...(filters.min_price !== undefined || filters.max_price !== undefined
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
        ...(filters.municipality || filters.neighborhood
          ? {
              property_localization: {
                ...(filters.municipality && {
                  municipality: {
                    contains: filters.municipality,
                    mode: "insensitive",
                  },
                }),
                ...(filters.neighborhood && {
                  neighborhood: {
                    contains: filters.neighborhood,
                    mode: "insensitive",
                  },
                }),
              },
            }
          : {}),
        ...(filters.listing_status
          ? {
              property_listing: {
                some: {
                  status: filters.listing_status as any,
                  delisted_at: null,
                },
              },
            }
          : {}),
      },
      include: propertyInclude,
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
  },

  findAllProperties: async (limit: number, cursor: number) => {
    return propertyAdminRepository.findProperties({}, limit, cursor);
  },

  findPropertyById: async (id: number) => {
    return prisma.properties.findUnique({
      where: { id },
      include: propertyInclude,
    });
  },

  findPropertiesByStatus: async (
    status: PropertyStatus,
    limit: number,
    cursor: number,
  ) => {
    return propertyAdminRepository.findProperties(
      { status_property: status },
      limit,
      cursor,
    );
  },

  findPropertiesByOwner: async (
    owner_id: number,
    limit: number,
    cursor: number,
  ) => {
    return propertyAdminRepository.findProperties({ owner_id }, limit, cursor);
  },

  searchProperties: async (
    filters: PropertyAdminFilters,
    limit: number,
    cursor: number,
  ) => {
    return propertyAdminRepository.findProperties(filters, limit, cursor);
  },
};
