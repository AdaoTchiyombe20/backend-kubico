import type { Request, Response, NextFunction } from "express";
import {
    NegociationEventDto,
    AcceptNegociationDto,
    RejectNegociationDto,
    CounterOfferDto,
    CancelNegociationDto,
    type NegociationEventDtoType,
    type AcceptNegociationDtoType,
    type RejectNegociationDtoType,
    type CounterOfferDtoType,
    type CancelNegociationDtoType,
} from "../dto/negociationEvent.dto.js";
import { negociationEventService } from "../services/negociationEvent.services.js";
import { AppError } from "../errors/App.Errors.js";

export const negociationEventController = {
    // ============================================
    // 1. INICIAR NEGOCIAÇÃO
    // ============================================

    async initNegociationEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            const data: NegociationEventDtoType = NegociationEventDto.parse(req.body);
            
            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.initNegociationEvent(profile_id, data);

            res.status(201).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 2. ACEITAR PROPOSTA
    // ============================================

    async acceptNegociation(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            const data: AcceptNegociationDtoType = AcceptNegociationDto.parse(req.body);

            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.acceptNegociation(profile_id, data);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 3. REJEITAR PROPOSTA
    // ============================================

    async rejectNegociation(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            const data: RejectNegociationDtoType = RejectNegociationDto.parse(req.body);

            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.rejectNegociation(profile_id, data);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 4. ENVIAR CONTRAPROPOSTA
    // ============================================

    async sendCounterOffer(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            const data: CounterOfferDtoType = CounterOfferDto.parse(req.body);

            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.sendCounterOffer(profile_id, data);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 5. CANCELAR NEGOCIAÇÃO
    // ============================================

    async cancelNegociation(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            const data: CancelNegociationDtoType = CancelNegociationDto.parse(req.body);

            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.cancelNegociation(profile_id, data);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 6. OBTER HISTÓRICO
    // ============================================

    async getNegociationHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            const negociation_id = Number(req.params.negociation_id);

            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);

            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);
            if (isNaN(negociation_id)) throw new AppError("ID da negociação inválido!", 400);

            const result = await negociationEventService.getNegociationHistory(
                profile_id,
                negociation_id
            );

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 7. LISTAR MINHAS NEGOCIAÇÕES
    // ============================================

    async getUserNegotiations(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
           
            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.getUserNegotiations(profile_id);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },

    // ============================================
    // 8. LISTAR NEGOCIAÇÕES PENDENTES
    // ============================================

    async getPendingNegotiations(req: Request, res: Response, next: NextFunction) {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            if (!profile_id) throw new AppError("Perfil não encontrado!", 401);
            if (isNaN(profile_id)) throw new AppError("ID do perfil inválido!", 400);

            const result = await negociationEventService.getPendingNegotiations(profile_id);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },
};