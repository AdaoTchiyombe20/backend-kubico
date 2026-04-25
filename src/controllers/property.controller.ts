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
        cursor: getAllProperties.cursor,
        properties: getAllProperties
      })
    } catch (error) {
      next(error);
    }
  },
  findUserProperties: async(req: Request, res: Response, next: NextFunction)=> { 
    try{
      const profileId = req.accessUser?.sub;
      const limit = req.query.limit || 20;
      const lastPropertyId = req.query.cursor || 0;
      if(!profileId) throw new AppError("Perfil não encontrado!", 404)
      if (Array.isArray(limit)) throw new AppError("Valor invalido!", 400);
      if (Array.isArray(lastPropertyId)) throw new AppError("Valor invalido!", 400);
      const properties = await propertyService.findUserProperties(Number(profileId), Number(limit), Number(lastPropertyId));
      res.json({
        sucess: true,
        cursor: properties.cursor,
        properties: properties,
      })
    }catch(error){
      next(error)
    }
  },
  createProperty: async(req: Request, res: Response, next: NextFunction) => {
    try{
      req.setTimeout(120_000);
      const profileId = req.accessUser?.sub;
      if(!profileId) throw new AppError("Perfil não encontrado!", 404)

      const files = req.files as { [fieldName: string]: Express.Multer.File[] } ;

      const data: CreatePropertyDTO = createPropertySchema.parse({...req.body}); 

      const { title, description, address_info,type_purchase, neighborhood, municipality, price, total_area, type_of_property, compartments, latitude, longitude} = data;

      if(!files || Object.keys(files).length === 0) throw new AppError("Pelo menos uma imagem ou vídeo é obrigatório!", 400)

      const createProperty = await propertyService.createProperty({profile_id: Number(profileId), title, type_purchase, type_of_property, description, price, total_area, address_info, neighborhood, municipality, compartments, latitude, longitude }, files);

      res.status(201).json({
        sucess: true,
        property: createProperty
      })
      
    }catch(error){
      next(error)
    }
  }, 
  publishProperty: async(req: Request, res: Response, next: NextFunction)=> {
    try{
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      if(!profileId) throw new AppError("Perfil não encontrado!", 404)
      const publish = await propertyService.publishProperty(Number(profileId), Number(propertyId));
    }catch(error){
      next(error)
    }
  },
  unPublishProperty: async(req: Request, res: Response, next: NextFunction)=> {
    try{
    }catch(error){
      next(error)
    } 
  }
};
