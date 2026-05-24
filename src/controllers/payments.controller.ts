import type {Request, Response,NextFunction} from "express";
import { paymentDto, type PaymentDto } from "../dto/payment.dto.js";
import { paymentsService } from "../services/payments.services.js";
import { success } from "zod";
export const paymentsController = {
    propertyPayment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paymentData : PaymentDto = paymentDto.parse(req.body);

            const result = await paymentsService.processPayment(paymentData);

            res.json({
                success: true,
                result
            })
            
        }catch (error) {
            next(error);
        }
    }
}