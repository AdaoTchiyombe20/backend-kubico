import type {Request, Response,NextFunction} from "express";
import { paymentDto, type PaymentDto } from "../dto/payment.dto.js";
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
    }
}