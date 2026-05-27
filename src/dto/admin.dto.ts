import z from 'zod'
import {
  ListingStatus,
  PaymentStatus,
  PaymentType,
  NegociationStatus,
  ProfileRoles,
  ProfileType,
  PropertyStatus,
  Property_purchase,
  TypeProperties,
  UserRoleStatus,
  UserStatus,
} from "@prisma/client";

export const createAdmin = z.object({
    adminsName: z.string('Only string').min(3,'Min 3 characteres'),
    email: z.string('Only String').email('Email invalido!'),
    accessLevel: z.enum(['SUPER_ADMIN','NORMAL']),
    password: z.string('Only string').min(3,'Min 3 characteres')
})

export const loginAdmin = z.object({
    email: z.string('Only String').email('Email invalido!'),
    password: z.string('Only String').min(6,'Min 6 characters')
})



// ============================================
// PAYMENT FILTERS DTO
// ============================================
export const PaymentFiltersSchema = z.object({
  status: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.HELD,
    PaymentStatus.RELEASED,
    PaymentStatus.CANCELLED,
  ]).optional(),
  payment_type: z.enum([
    PaymentType.DIRECT_PURCHASE,
    PaymentType.NEGOCIATED_PURCHASE,
  ]).optional(),
  owner_id: z.coerce.number().int().positive().optional(),
  client_id: z.coerce.number().int().positive().optional(),
  property_listing_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().default(20),
  cursor: z.coerce.number().int().nonnegative().default(0),
});

export type PaymentFiltersDTO = z.infer<typeof PaymentFiltersSchema>;

// ============================================
// NEGOCIATION FILTERS DTO
// ============================================
export const NegociationFiltersSchema = z.object({
  status: z.enum([
    NegociationStatus.PENDING,
    NegociationStatus.ACCEPTED,
    NegociationStatus.REJECTED,
    NegociationStatus.CANCELLED,
  ]).optional(),
  payment_status: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.HELD,
    PaymentStatus.RELEASED,
    PaymentStatus.CANCELLED,
  ]).optional(),
  owner_id: z.coerce.number().int().positive().optional(),
  client_id: z.coerce.number().int().positive().optional(),
  property_listing_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().default(20),
  cursor: z.coerce.number().int().nonnegative().default(0),
});

export type NegociationFiltersDTO = z.infer<typeof NegociationFiltersSchema>;

// ============================================
// PROPERTY FILTERS DTO
// ============================================
export const PropertyFiltersSchema = z.object({
  type_of_property: z.enum([
    TypeProperties.APARTAMENTO,
    TypeProperties.VIVENDA,
    TypeProperties.ESCRITORIO,
    TypeProperties.FAZENDA,
    TypeProperties.TERRENO,
    TypeProperties.LOJA,
    TypeProperties.ARMAZEM,
    TypeProperties.HOTEL,
    TypeProperties.PENTHOUSE,
    TypeProperties.DUPLEX,
    TypeProperties.TRIPLEX,
    TypeProperties.QUARTO,
    TypeProperties.SUITE,
    TypeProperties.CONDOMINIO,
    TypeProperties.RESORT,
    TypeProperties.HOSPITAL,
    TypeProperties.ESCOLA,
    TypeProperties.RESTAURANTE,
    TypeProperties.CINEMA,
    TypeProperties.SHOPPING,
  ]).optional(),
  type_property_purchase: z.enum([
    Property_purchase.FOR_SALE,
    Property_purchase.FOR_RENT,
  ]).optional(),
  status_property: z.enum([
    PropertyStatus.PUBLICADO,
    PropertyStatus.NAO_PUBLICADO,
    PropertyStatus.EM_ANALISE,
  ]).optional(),
  listing_status: z.enum([
    ListingStatus.RESERVADO,
    ListingStatus.VENDIDO,
    ListingStatus.ALUGADO,
    ListingStatus.DISPONIVEL,
  ]).optional(),
  owner_id: z.coerce.number().int().positive().optional(),
  is_negotiable: z.coerce.boolean().optional(),
  municipality: z.string().optional(),
  neighborhood: z.string().optional(),
  min_price: z.coerce.number().nonnegative().optional(),
  max_price: z.coerce.number().nonnegative().optional(),
  limit: z.coerce.number().int().positive().default(20),
  cursor: z.coerce.number().int().nonnegative().default(0),
});

export type PropertyFiltersDTO = z.infer<typeof PropertyFiltersSchema>;

export const UserFiltersSchema = z.object({
  status: z.enum([
    UserStatus.ACTIVE,
    UserStatus.SUSPENDED,
  ]).optional(),
  role: z.enum([
    ProfileRoles.CLIENT,
    ProfileRoles.OWNER,
    ProfileRoles.ADMIN,
  ]).optional(),
  role_status: z.enum([
    UserRoleStatus.PENDING,
    UserRoleStatus.APPROVED,
    UserRoleStatus.REJECTED,
  ]).optional(),
  type: z.enum([
    ProfileType.INDIVIDUAL,
    ProfileType.COMPANY,
  ]).optional(),
  email: z.string().trim().optional(),
  name: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().default(20),
  cursor: z.coerce.number().int().nonnegative().default(0),
});

export type UserFiltersDTO = z.infer<typeof UserFiltersSchema>;

// ============================================
// RELEASE PAYMENT DTO
// ============================================
export const ReleasePaymentSchema = z.object({
  payment_id: z.coerce.number().int().positive(),
});

export type ReleasePaymentDTO = z.infer<typeof ReleasePaymentSchema>;

export type createAdminDTO = z.infer <typeof createAdmin>
export type AdminLoginDTO = z.infer<typeof loginAdmin>
