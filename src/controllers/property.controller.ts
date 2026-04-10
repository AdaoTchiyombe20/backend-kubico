import type { Request, Response, NextFunction } from "express";
import { type CreatePropertyDTO, createPropertySchema } from "../dto/property.dto.js";
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
      const profileId = req.accessUser?.sub;
      if(!profileId) throw new AppError("Perfil não encontrado!", 404)

      const files = req.files as { [fieldName: string]: Express.Multer.File[] } ;

      const data: CreatePropertyDTO = createPropertySchema.parse({...req.body,type_of_property: req.body.type_of_property.toLowerCase(), status_property: req.body.status_property.toLowerCase(),});

      const { title, description, price, total_area, type_of_property, status_property } = data;

      if(!files || Object.keys(files).length === 0) throw new AppError("Pelo menos uma imagem ou vídeo é obrigatório!", 400)

      const createProperty = await propertyService.createProperty({profile_id: Number(profileId), title, type_of_property, description, status_property, price, total_area }, files);
      
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
