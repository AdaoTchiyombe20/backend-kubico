import type {Request, Response,NextFunction} from "express";

export const paymentsController = {
    propertyPayment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            
        }catch (error) {
            next(error);
        }
    }
}