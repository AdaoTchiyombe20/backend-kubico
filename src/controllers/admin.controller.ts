import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/App.Errors.js";
import {
  adminNegociationService,
  adminPaymentService,
  adminPropertyService,
  adminUserService,
} from "../services/admin.services.js";
import {
  NegociationFiltersSchema,
  PaymentFiltersSchema,
  PropertyFiltersSchema,
  UserFiltersSchema,
} from "../dto/admin.dto.js";

const handleZodError = (err: unknown, next: NextFunction) => {
  if (err instanceof ZodError) {
    return next(new AppError("Dados de entrada invalidos!", 400));
  }

  return next(err);
};

export const adminController = {
  findUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = UserFiltersSchema.parse(req.query);
      const result = await adminUserService.findUsers(filters);

      res.json({
        success: true,
        data: result.users,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  findUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError("ID invalido!", 400);

      const user = await adminUserService.findUserById(id);

      res.json({
        success: true,
        message: "Usuario encontrado!",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  findAllPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = PaymentFiltersSchema.parse(req.query);
      const result = await adminPaymentService.findPayments(filters);

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  findAllHeldPayments: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = PaymentFiltersSchema.parse({
        ...req.query,
        status: "HELD",
      });
      const result = await adminPaymentService.findPayments(filters);

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  findPaymentById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError("ID invalido!", 400);

      const payment = await adminPaymentService.findPaymentById(id);

      res.json({
        success: true,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },

  findAllReceivedPayments: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = PaymentFiltersSchema.parse(req.query);
      if (!filters.owner_id) {
        throw new AppError("owner_id e obrigatorio!", 400);
      }

      const result = await adminPaymentService.findReceivedPayments(
        filters.owner_id,
        filters.limit,
        filters.cursor,
      );

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  findAllReleasedPayments: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = PaymentFiltersSchema.parse({
        ...req.query,
        status: "RELEASED",
      });
      const result = await adminPaymentService.findPayments(filters);

      res.json({
        success: true,
        data: result.payments,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  releasePayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment_id = Number(req.params.id);
      const released_by = req.accessUser?.profileId;

      if (isNaN(payment_id)) throw new AppError("ID de pagamento invalido!", 400);
      if (!released_by) throw new AppError("Usuario nao autenticado!", 401);

      const result = await adminPaymentService.releasePayment(
        payment_id,
        Number(released_by),
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

  findAllNegociations: async (
    req: Request,
    res: Response,
    next: NextFunction,
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
      handleZodError(err, next);
    }
  },

  findPendingNegociations: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = NegociationFiltersSchema.parse({
        ...req.query,
        status: "PENDING",
      });
      const result = await adminNegociationService.findAllNegociations(filters);

      res.json({
        success: true,
        data: result.negociations,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  findHeldNegociations: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = NegociationFiltersSchema.parse({
        ...req.query,
        payment_status: "HELD",
      });
      const result = await adminNegociationService.findAllNegociations(filters);

      res.json({
        success: true,
        data: result.negociations,
        cursor: result.cursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      handleZodError(err, next);
    }
  },

  findNegociation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError("ID invalido!", 400);

      const negociation = await adminNegociationService.findNegociationById(id);

      res.json({
        success: true,
        data: negociation,
      });
    } catch (err) {
      next(err);
    }
  },

  findAllProperties: async (
    req: Request,
    res: Response,
    next: NextFunction,
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
      handleZodError(err, next);
    }
  },

  findProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError("ID invalido!", 400);

      const property = await adminPropertyService.findPropertyById(id);

      res.json({
        success: true,
        data: property,
      });
    } catch (err) {
      next(err);
    }
  },
};
