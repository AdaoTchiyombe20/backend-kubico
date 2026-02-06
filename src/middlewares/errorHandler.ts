import { type Request,type Response,type NextFunction } from "express";
import { AppError } from "../errors/App.Errors.js";
import z from 'zod'

export const errorHandler = ( error: Error, req: Request, res: Response, next: NextFunction) =>{
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }

    if(error instanceof z.ZodError){
        return res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            details: error.issues

        })
    }

    console.error('Erro não tratado:', error);
    return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
    });

}