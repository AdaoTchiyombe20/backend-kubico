import { AppError } from "../errors/App.Errors.js";
import { negociationAdminRepository, propertyAdminRepository, paymentAdminRepository, adminRepository, userAdminRepository } from "../repositories/admin/admin.respositories.js";
import type { PaymentFiltersDTO, NegociationFiltersDTO, PropertyFiltersDTO, UserFiltersDTO } from "../dto/admin.dto.js";
import { ListingStatus, propertySelingStatus, type AccessLevel } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { authRepositories } from "../repositories/auth/auth.repositories.js";
import { refreshTokenUser } from "../repositories/auth/refreshToken.repositories.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";
import { historyPropertyRepository } from "../repositories/property/historyProperty.respositories.js";

const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as Partial<T>;

export const adminPaymentService = {
  // ============================================
  // PAYMENTS SERVICE
  // ============================================

  findAllPayments: async (limit: number, cursor: number) => {
    try {
      const payments = await paymentAdminRepository.findAllPayments(limit, cursor);
      const hasNextPage = payments.length > limit;
      const paginated = hasNextPage ? payments.slice(0, -1) : payments;

      return {
        payments: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar pagamentos: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findPaymentById: async (id: number) => {
    try {
      const payment = await paymentAdminRepository.findPaymentById(id);

      if (!payment) {
        throw new AppError("Pagamento não encontrado!", 404);
      }

      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar pagamento: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findPaymentsByStatus: async (filters: PaymentFiltersDTO) => {
    try {
      if (!filters.status) {
        throw new AppError("Status de pagamento é obrigatório!", 400);
      }

      const payments = await paymentAdminRepository.findPaymentsByStatus(
        filters.status,
        filters.limit,
        filters.cursor
      );

      const hasNextPage = payments.length > filters.limit;
      const paginated = hasNextPage ? payments.slice(0, -1) : payments;

      return {
        payments: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao filtrar pagamentos: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findPayments: async (filters: PaymentFiltersDTO) => {
    try {
      const payments = await paymentAdminRepository.findPayments(
        omitUndefined({
          status: filters.status,
          payment_type: filters.payment_type,
          owner_id: filters.owner_id,
          client_id: filters.client_id,
          property_listing_id: filters.property_listing_id,
        }),
        filters.limit,
        filters.cursor
      );

      const hasNextPage = payments.length > filters.limit;
      const paginated = hasNextPage ? payments.slice(0, -1) : payments;

      return {
        payments: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar pagamentos: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findReceivedPayments: async (owner_id: number, limit: number, cursor: number) => {
    try {
      const payments = await paymentAdminRepository.findReceivedPayments(
        owner_id,
        limit,
        cursor
      );

      const hasNextPage = payments.length > limit;
      const paginated = hasNextPage ? payments.slice(0, -1) : payments;

      return {
        payments: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar pagamentos recebidos: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findReleasedPayments: async (limit: number, cursor: number) => {
    try {
      const payments = await paymentAdminRepository.findReleasedPayments(limit, cursor);

      const hasNextPage = payments.length > limit;
      const paginated = hasNextPage ? payments.slice(0, -1) : payments;

      return {
        payments: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar pagamentos liberados: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  releasePayment: async (payment_id: number, released_by: number) => {
    try {
      const payment = await paymentAdminRepository.findPaymentById(payment_id);

      if (!payment) {
        throw new AppError("Pagamento não encontrado!", 404);
      }

      if (payment.status === "RELEASED") {
        throw new AppError("Este pagamento já foi liberado!", 400);
      }

      if (payment.status === "CANCELLED") {
        throw new AppError("Não é possível liberar um pagamento cancelado!", 400);
      }

      if (payment.status !== "HELD") {
        throw new AppError("Apenas pagamentos retidos podem ser liberados!", 400);
      }

      const releasedPayment = await paymentAdminRepository.releasePayment(
        payment_id,
        released_by
      );

      const property = (releasedPayment as any).property_listing.property;
      const finalListingStatus =
        property.type_property_purchase === "FOR_RENT"
          ? ListingStatus.ALUGADO
          : ListingStatus.VENDIDO;
      const finalHistoryStatus =
        property.type_property_purchase === "FOR_RENT"
          ? propertySelingStatus.ALUGADO
          : propertySelingStatus.VENDIDO;

      await propertyListingRepository.updateListingStatus(
        releasedPayment.property_listing_id,
        finalListingStatus,
        new Date()
      );

      await historyPropertyRepository.createHistoryProperty(
        releasedPayment.owner_id,
        property.id,
        propertySelingStatus.RESERVADO,
        finalHistoryStatus
      );

      return {
        message: "Pagamento liberado com sucesso!",
        payment: releasedPayment,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao liberar pagamento: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },
};

export const adminService = {
  //auth
  createAdmin: async (
    adminsName: string,
    email: string,
    adminPassword: string,
    accessLevel: AccessLevel,
  ) => {
    try {
      const verifyEmail = await userRepository.findByEmail(email);

      if (verifyEmail) throw new AppError("This e-mail alredy exist", 400);

      const password = await hashPassword(adminPassword);

      const createuser = await authRepositories.signUp({ email, password });

      const createAdminProfile = await profileRepository.createProfile(
        createuser.id,
        "INDIVIDUAL",
      );

      const createAdminRole = await profileRole.insertValues(
        createAdminProfile.id,
        3,
        "APPROVED",
      );

      await adminRepository.createAdmin(
        createuser.id,
        adminsName,
        createAdminRole.id,
        accessLevel,
      );

      const refreshToken = jwt.sign(
              {
                sub: createuser.id,
              },
              ENV.JWT_REFRESH_SECRET,
              { expiresIn: "7d" },
            );
      
      const accessToken = jwt.sign(
        {
          sub: String(createuser.id),
          profileId: createAdminProfile.id,
          role: "ADMIN",
          iat: Math.floor(Date.now() / 1000),
          type: createAdminProfile.type,
        },
        ENV.JWT_SECRET,
        { expiresIn: "15m" },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: createuser.id,
        expiresAt: expiresAt,
      });

      return { accessToken, refreshToken, message: "Admin criado com sucesso!" };

    } catch (error) {
      throw new AppError(`Error: ${error}`);
    }
  },
  login: async (email: string, password: string) => {
    try {
      const findEmail = await userRepository.findByEmail(email);

      if (!findEmail) throw new AppError("User not Found", 404);

      const findProfileById = await profileRepository.findAuthProfileByUserId(
        findEmail.id,
      );

      if (!findProfileById) throw new AppError("Profile not Found!", 404);

      const verifyAdmin = await profileRole.findProfileRoleByRole(
        findProfileById.id,
        3,
      );

      if(!verifyAdmin) throw new AppError("Admin not found!", 404)
      if(verifyAdmin?.status !== "APPROVED") throw new AppError("Admin nao aprovado!", 403)

      const verifiyPassword = await comparePassword(password, findEmail!.password);

      if (!verifiyPassword) throw new AppError("Wrong password!", 401);

      const refreshToken = jwt.sign(
        {
          sub: findEmail.id,
        },
        ENV.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );
      const accessToken = jwt.sign(
        {
          sub: String(findEmail.id),
          profileId: findProfileById.id,
          role: "ADMIN",
          iat: Math.floor(Date.now() / 1000),
          type: findProfileById.type,
        },
        ENV.JWT_SECRET,
        { expiresIn: "15m" },
      );
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: findEmail.id,
        expiresAt: expiresAt,
      });
      return { accessToken, refreshToken, message: "Admin com sessao iniciada!" };
    } catch (error) {
      throw new AppError(`Erro ao entrar como admin: ${error}`, 400);
    }
  },
  findAdmin: async (adminRoleId: number, userId: number)=> {
    try{
      const findAdmin = await adminRepository.findAdmin(adminRoleId, userId)
      if(!findAdmin) throw new AppError('Admin nao encontrado', 404)
      return findAdmin
    
    }catch(error){
      throw new AppError(`Erro ao procurar por admin: ${error}`)
    }
  },
}

export const adminNegociationService = {
  // ============================================
  // NEGOCIATION SERVICE
  // ============================================

  findAllNegociations: async (filters: NegociationFiltersDTO) => {
    try {
      const negociations = await negociationAdminRepository.findNegociations(
        omitUndefined({
          status: filters.status,
          payment_status: filters.payment_status,
          owner_id: filters.owner_id,
          client_id: filters.client_id,
          property_listing_id: filters.property_listing_id,
        }),
        filters.limit,
        filters.cursor
      );

      const hasNextPage = negociations.length > filters.limit;
      const paginated = hasNextPage ? negociations.slice(0, -1) : negociations;

      return {
        negociations: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar negociações: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findNegociationById: async (id: number) => {
    try {
      const negociation = await negociationAdminRepository.findNegociationById(id);

      if (!negociation) {
        throw new AppError("Negociação não encontrada!", 404);
      }

      return negociation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar negociação: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },
};

export const adminPropertyService = {
  // ============================================
  // PROPERTY SERVICE
  // ============================================

  findAllProperties: async (filters: PropertyFiltersDTO) => {
    try {
      let properties;

      // Se há filtros, usa busca avançada
      if (
        filters.type_of_property ||
        filters.type_property_purchase ||
        filters.status_property ||
        filters.municipality ||
        filters.neighborhood ||
        filters.min_price !== undefined ||
        filters.max_price !== undefined ||
        filters.listing_status ||
        filters.owner_id !== undefined ||
        filters.is_negotiable !== undefined
      ) {
        const searchParams: { [key: string]: any } = {};
        if (filters.type_of_property !== undefined) searchParams.type_of_property = filters.type_of_property;
        if (filters.type_property_purchase !== undefined) searchParams.type_property_purchase = filters.type_property_purchase;
        if (filters.status_property !== undefined) searchParams.status_property = filters.status_property;
        if (filters.municipality !== undefined) searchParams.municipality = filters.municipality;
        if (filters.neighborhood !== undefined) searchParams.neighborhood = filters.neighborhood;
        if (filters.min_price !== undefined) searchParams.min_price = filters.min_price;
        if (filters.max_price !== undefined) searchParams.max_price = filters.max_price;
        if (filters.listing_status !== undefined) searchParams.listing_status = filters.listing_status;
        if (filters.owner_id !== undefined) searchParams.owner_id = filters.owner_id;
        if (filters.is_negotiable !== undefined) searchParams.is_negotiable = filters.is_negotiable;

        properties = await propertyAdminRepository.searchProperties(
          searchParams,
          filters.limit,
          filters.cursor
        );
      } else {
        properties = await propertyAdminRepository.findAllProperties(
          filters.limit,
          filters.cursor
        );
      }

      const hasNextPage = properties.length > filters.limit;
      const paginated = hasNextPage ? properties.slice(0, -1) : properties;

      return {
        properties: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar propriedades: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findPropertyById: async (id: number) => {
    try {
      const property = await propertyAdminRepository.findPropertyById(id);

      if (!property) {
        throw new AppError("Propriedade não encontrada!", 404);
      }

      return property;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar propriedade: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

/*   findPropertiesByStatus: async (
    status: string,
    limit: number,
    cursor: number
  ) => {
    try {
      const properties = await propertyAdminRepository.findPropertiesByStatus(
        status,
        limit,
        cursor
      );

      const hasNextPage = properties.length > limit;
      const paginated = hasNextPage ? properties.slice(0, -1) : properties;

      return {
        properties: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao filtrar propriedades por status: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },
 */
 
  findPropertiesByOwner: async (
    owner_id: number,
    limit: number,
    cursor: number
  ) => {
    try {
      const properties = await propertyAdminRepository.findPropertiesByOwner(
        owner_id,
        limit,
        cursor
      );

      const hasNextPage = properties.length > limit;
      const paginated = hasNextPage ? properties.slice(0, -1) : properties;

      return {
        properties: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar propriedades do proprietário: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },
};

export const adminUserService = {
  findUsers: async (filters: UserFiltersDTO) => {
    try {
      const users = await userAdminRepository.findUsers(
        omitUndefined({
          status: filters.status,
          role: filters.role,
          role_status: filters.role_status,
          type: filters.type,
          email: filters.email,
          name: filters.name,
        }),
        filters.limit,
        filters.cursor
      );

      const hasNextPage = users.length > filters.limit;
      const paginated = hasNextPage ? users.slice(0, -1) : users;

      return {
        users: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar usuarios: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },

  findUserById: async (id: number) => {
    try {
      const user = await userAdminRepository.findUserById(id);

      if (!user) {
        throw new AppError("Perfil inexistente!", 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Erro ao buscar usuario: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  },
};
