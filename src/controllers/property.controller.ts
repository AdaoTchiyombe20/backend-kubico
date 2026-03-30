import type { Request, Response, NextFunction } from "express";
import { propertyService } from "../services/property.services.js";
import { AppError } from "../errors/App.Errors.js";

export const propertyController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit || 20;
      const lastPropertyId = req.query.cursor;

      if (Array.isArray(limit)) throw new AppError("Valor invalido!", 400);
      if (!lastPropertyId || Array.isArray(lastPropertyId))
        throw new AppError("Valor invalido!", 400);

      const getAllProperties = await propertyService.findAll(
        Number(limit),
        Number(lastPropertyId),
      );

      res.json({
        sucess: true,
        properties: getAllProperties
      })
    } catch (error) {
      next(error);
    }
  },
  findUserProperties: async(req: Request, res: Response, next: NextFunction)=> { 
    try{

    }catch(error){
      next(error)
    }
  },
  createProperty: async(req: Request, res: Response, next: NextFunction) => {
    try{

    }catch(error){
      next(error)
    }
  }, 
  publishProperty: async(req: Request, res: Response, next: NextFunction)=> {
    try{

    }catch(error){
      next(error)
    }
  }
};
