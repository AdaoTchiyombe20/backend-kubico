import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/App.Errors.js";
import {
    adminNegociationService,
  adminPaymentService,
  adminPropertyService,
} from "../services/admin.services.js";
import {
  PaymentFiltersSchema,
  NegociationFiltersSchema,
  PropertyFiltersSchema,
  ReleasePaymentSchema,
} from "../dto/admin.dto.js";
import { jwt, ZodError } from "zod";
import type { AccessLevel } from "@prisma/client";
import type { ENV } from "../config/env.js";
import { adminRepository } from "../repositories/admin/admin.respositories.js";
import { authRepositories } from "../repositories/auth/auth.repositories.js";
import type { refreshTokenUser } from "../repositories/auth/refreshToken.repositories.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { sendVerificationEmail } from "../services/mail.services.js";
import { hashPassword, comparePassword } from "../utils/hash.js";




export const adminController = {
  // ============================================
  // PAYMENTS ENDPOINTS
  // ============================================

  /**
   * GET /admin/payments
   * Lista todos os pagamentos com paginação
   * Query params: limit, cursor, status (opcional)
   */
  findAllPayments: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = PaymentFiltersSchema.parse(req.query);

      let result;
      if (filters.status) {
        result = await adminPaymentService.findPaymentsByStatus(filters);
      } else {
        result = await adminPaymentService.findAllPayments(
          filters.limit,
          filters.cursor
        );
      }

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Dados de entrada inválidos!", 400));
      }
      next(err);
    }
  },

  /**
   * GET /admin/payments/:id
   * Busca um pagamento específico por ID
   */
  findPaymentById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        throw new AppError("ID inválido!", 400);
      }

      const payment = await adminPaymentService.findPaymentById(id);

      res.json({
        success: true,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /admin/payments/received/:owner_id
   * Lista pagamentos recebidos por um proprietário
   * Query params: limit, cursor
   */
  findAllReceivedPayments: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const owner_id = Number(req.params.owner_id);
      const limit = Number(req.query.limit) || 20;
      const cursor = Number(req.query.cursor) || 0;

      if (isNaN(owner_id)) {
        throw new AppError("ID do proprietário inválido!", 400);
      }

      const result = await adminPaymentService.findReceivedPayments(
        owner_id,
        limit,
        cursor
      );

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /admin/payments/released
   * Lista pagamentos liberados
   * Query params: limit, cursor
   */
  findAllReleasedPayments: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const cursor = Number(req.query.cursor) || 0;

      if (isNaN(limit) || isNaN(cursor)) {
        throw new AppError("Parâmetros de paginação inválidos!", 400);
      }

      const result = await adminPaymentService.findReleasedPayments(
        limit,
        cursor
      );

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /admin/payments/:id/release
   * Libera um pagamento pendente
   * Body: {}
   * Header: Authorization: Bearer {accessToken}
   */
    releasePayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment_id = Number(req.params.id);
      const released_by = req.accessUser?.profileId;

      if (isNaN(payment_id)) {
        throw new AppError("ID de pagamento inválido!", 400);
      }

      if (!released_by) {
        throw new AppError("Usuário não autenticado!", 401);
      }

      const result = await adminPaymentService.releasePayment(
        payment_id,
        Number(released_by)
      );

      res.json({
        success: true,
        message: result.message,
        data: result.payment,
      });
    } catch (err) {
      next(err);
    }
    },

  // ============================================
  // NEGOCIATION ENDPOINTS
  // ============================================

  /**
   * GET /admin/negotiations
   * Lista todas as negociações com paginação
   * Query params: limit, cursor, status (opcional)
   */
  findAllNegociations: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = NegociationFiltersSchema.parse(req.query);

      const result = await adminNegociationService.findAllNegociations(filters);

      res.json({
        success: true,
        data: result.negociations,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Dados de entrada inválidos!", 400));
      }
      next(err);
    }
  },

  /**
   * GET /admin/negotiations/:id
   * Busca uma negociação específica por ID
   */
  findNegociation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        throw new AppError("ID inválido!", 400);
      }

      const negociation = await adminNegociationService.findNegociationById(id);

      res.json({
        success: true,
        data: negociation,
      });
    } catch (err) {
      next(err);
    }
  },

  // ============================================
  // PROPERTIES ENDPOINTS
  // ============================================

  /**
   * GET /admin/properties
   * Lista todas as propriedades com filtros avançados
   * Query params:
   *   - limit: number (default 20)
   *   - cursor: number (default 0)
   *   - type_of_property: enum (opcional)
   *   - type_property_purchase: enum (opcional)
   *   - status_property: enum (opcional)
   *   - municipality: string (opcional)
   *   - neighborhood: string (opcional)
   *   - min_price: number (opcional)
   *   - max_price: number (opcional)
   */
   findAllProperties: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = PropertyFiltersSchema.parse(req.query);

      const result = await adminPropertyService.findAllProperties(filters);

      res.json({
        success: true,
        data: result.properties,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new AppError("Dados de entrada inválidos!", 400));
      }
      next(err);
    }
  },

  /**
   * GET /admin/properties/:id
   * Busca uma propriedade específica por ID
   */
  /* findProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        throw new AppError("ID inválido!", 400);
      }

      const property = await adminPaymentService.(id);

      res.json({
        success: true,
        data: property,
      });
    } catch (err) {
      next(err);
    }
  }, */

  // ============================================
  // EXISTING ENDPOINTS (MANTER COMPATIBILIDADE)
  // ============================================

  /**
   * GET /admin/users
   * Lista todos os usuários (já implementado)
   */
  findUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit || 20;
      const lastPropertyId = req.query.cursor || 0;

      if (Array.isArray(limit)) throw new AppError("Valor inválido!", 400);
      if (Array.isArray(lastPropertyId))
        throw new AppError("Valor inválido!", 400);

      // Usando o profileRepository já existente
      const { profileRepository } = await import(
        "../repositories/Profile/profile.repositories.js"
      );
      const users = await profileRepository.findAll(
        Number(limit),
        Number(lastPropertyId)
      );

      const hasNextPage = users.length > Number(limit);
      const paginated = hasNextPage ? users.slice(0, -1) : users;

      res.json({
        success: true,
        data: paginated,
        cursor: hasNextPage ? paginated[paginated.length - 1]?.id : null,
        hasNextPage,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /admin/users/:id
   * Busca um usuário específico (já implementado)
   */
  findUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      if (isNaN(Number(id))) throw new AppError("ID inválido!", 400);

      const { profileRepository } = await import(
        "../repositories/Profile/profile.repositories.js"
      );
      const user = await profileRepository.findById(Number(id));

      if (!user) throw new AppError("Perfil inexistente!", 404);

      res.json({
        success: true,
        message: "Usuário encontrado!",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
};