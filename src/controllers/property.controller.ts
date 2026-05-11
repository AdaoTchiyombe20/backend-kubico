import type { Request, Response, NextFunction } from "express";
import { type CreatePropertyDTO, createPropertySchema, updatePropertyInfo, type UpdatePropertyInfoDTO } from "../dto/property.dto.js";
import { propertyService } from "../services/property.services.js";
import { AppError } from "../errors/App.Errors.js";

export const propertyController = {
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit || 20;
      const lastPropertyId = req.query.cursor || 0;
      if (Array.isArray(limit)) throw new AppError("Valor inválido!", 400);
      if (Array.isArray(lastPropertyId)) throw new AppError("Valor inválido!", 400);

      const getAllProperties = await propertyService.findAll(Number(limit), Number(lastPropertyId));

      res.json({
        success: true,
        cursor: getAllProperties.cursor,
        properties: getAllProperties.properties,
      });
    } catch (error) {
      next(error);
    }
  },

  findUserProperties: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const limit = req.query.limit || 20;
      const lastPropertyId = req.query.cursor || 0;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);
      if (Array.isArray(limit)) throw new AppError("Valor inválido!", 400);
      if (Array.isArray(lastPropertyId)) throw new AppError("Valor inválido!", 400);

      const properties = await propertyService.findUserProperties(Number(profileId), Number(limit), Number(lastPropertyId));

      res.json({
        success: true,
        cursor: properties.cursor,
        properties: properties.properties,
      });
    } catch (error) {
      next(error);
    }
  },

  publishProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const result = await propertyService.publishProperty(Number(profileId), Number(propertyId));

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  unPublishProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const result = await propertyService.unpublishProperty(Number(profileId), Number(propertyId));

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  createProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.setTimeout(120_000);
      const profileId = req.accessUser?.sub;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const files = req.files as { [fieldName: string]: Express.Multer.File[] };
      if (!files || Object.keys(files).length === 0)
        throw new AppError("Pelo menos uma imagem ou vídeo é obrigatório!", 400);

      const data: CreatePropertyDTO = createPropertySchema.parse({ ...req.body });
      const { title, description, address_info, type_purchase, neighborhood, municipality, price, is_negotiable, total_area, type_of_property, compartments, latitude, longitude } = data;

      const createProperty = await propertyService.createProperty(
        { profile_id: Number(profileId), title, type_purchase, type_of_property, description, price, is_negotiable, total_area, address_info, neighborhood, municipality, compartments, latitude, longitude },
        files,
      );

      res.status(201).json({ success: true, property: createProperty });
    } catch (error) {
      next(error);
    }
  },

  updatePropertyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const data: UpdatePropertyInfoDTO = updatePropertyInfo.parse({ ...req.body });
      const updateInfo = await propertyService.updatePropertyInfo(Number(profileId), Number(propertyId), data);

      res.json({
        success: true,
        property: updateInfo,
        message: "Informações do imóvel actualizadas com sucesso!",
      });
    } catch (error) {
      next(error);
    }
  },

  updatePropertyMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      const mediaId = req.params.mediaId;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const file = req.file;
      if (!file) throw new AppError("Ficheiro obrigatório!", 400);

      const updated = await propertyService.updatePropertyMedia(
        Number(profileId),
        Number(propertyId),
        Number(mediaId),
        file,
      );

      res.json({
        success: true,
        media: updated,
        message: "Media actualizada com sucesso!",
      });
    } catch (error) {
      next(error);
    }
  },

  deletePropertyMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      const mediaId = req.params.mediaId;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const result = await propertyService.deletePropertyMedia(
        Number(profileId),
        Number(propertyId),
        Number(mediaId),
      );

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  addPropertyMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const file = req.file;
      if (!file) throw new AppError("Ficheiro obrigatório!", 400);

      const media = await propertyService.addPropertyMedia(
        Number(profileId),
        Number(propertyId),
        file,
      );

      res.status(201).json({
        success: true,
        media,
        message: "Media adicionada com sucesso!",
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.sub;
      const propertyId = req.params.id;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const result = await propertyService.deleteProperty(Number(profileId), Number(propertyId));

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};
