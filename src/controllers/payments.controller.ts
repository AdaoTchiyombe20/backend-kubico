import type {Request, Response,NextFunction} from "express";
import { paymentActionDto, paymentDto, type PaymentDto } from "../dto/payment.dto.js";
import { paymentsService } from "../services/payments.services.js";
import { AppError } from "../errors/App.Errors.js";
export const paymentsController = {
    propertyPayment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const client_id = req.accessUser?.profileId as string;
            if(!client_id)
                throw new AppError("id de client nao existente", 404)

            const paymentData : PaymentDto = paymentDto.parse(req.body);

            const result = await paymentsService.processPayment(Number(client_id),paymentData);

            res.json({
                success: true,
                result
            })
            
        }catch (error) {
            next(error);
        }
    },
    releasePayment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            if (!profile_id || isNaN(profile_id)) {
                throw new AppError("id de perfil nao existente", 404);
            }

            const { payment_id } = paymentActionDto.parse(req.params);
            const result = await paymentsService.releaseHeldPayment(profile_id, payment_id);

            res.json({
                success: true,
                result
            });
        } catch (error) {
            next(error);
        }
    },
    cancelPayment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile_id = Number(req.accessUser?.profileId);
            if (!profile_id || isNaN(profile_id)) {
                throw new AppError("id de perfil nao existente", 404);
            }

            const { payment_id } = paymentActionDto.parse(req.params);
            const result = await paymentsService.cancelHeldPayment(profile_id, payment_id);

            res.json({
                success: true,
                result
            });
        } catch (error) {
            next(error);
        }
    },
}
