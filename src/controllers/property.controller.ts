import type { Request, Response, NextFunction } from "express";
import { type CreatePropertyDTO, createPropertySchema, updatePropertyInfo, type UpdatePropertyInfoDTO } from "../dto/property.dto.js";
import { propertyService } from "../services/property.services.js";
import { AppError } from "../errors/App.Errors.js";
import { type RawSearchFilters } from "../dto/property.dto.js";
import { QueryValidator } from "../utils/queryValidators.js";

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
      const profileId = req.accessUser?.profileId;
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
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const result = await propertyService.publishProperty(Number(profileId), Number(propertyId));

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  unPublishProperty: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
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
      const profileId = req.accessUser?.profileId;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const files = req.files as { [fieldName: string]: Express.Multer.File[] };
      if (!files || Object.keys(files).length === 0)
        throw new AppError("Pelo menos uma imagem ou vídeo é obrigatório!", 400);

      const data: CreatePropertyDTO = createPropertySchema.parse({ ...req.body });
      const { title, description, address_info, type_purchase, neighborhood, municipality, price, is_negotiable, total_area, type_of_property, compartments, latitude, longitude } = data;

      const createProperty = await propertyService.createProperty(
        { profile_id: Number(profileId), title, type_purchase, type_of_property, description, price, is_negotiable, total_area, address_info, neighborhood, municipality, compartments, latitude:latitude ?? null, longitude: longitude ?? null },
        files,
      );

      res.status(201).json({ success: true, property: createProperty });
    } catch (error) {
      next(error);
    }
  },

  findAllListings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit || 20;
      const lastPropertyId = req.query.cursor || 0;
      if (Array.isArray(limit)) throw new AppError("Valor inválido!", 400);
      if (Array.isArray(lastPropertyId)) throw new AppError("Valor inválido!", 400);

      const properties = await propertyService.findAllListings(Number(limit), Number(lastPropertyId));

      res.json({
        success: true,
        cursor: properties.cursor,
        properties: properties.properties,
      });
    } catch (error) {
      next(error);
    }
  },

  findListingById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
}

      const property = await propertyService.findListingById(propertyId);

      res.json({ success: true, property });
    } catch (error) {
      next(error);
    } 
  },

  searchListings: async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type_purchase, type_of_property, neighborhood, municipality, min_price, max_price, is_negotiable } = req.query;
    
    const filters: RawSearchFilters = {
      type_purchase: QueryValidator.ensureSingleString(type_purchase, 'type_purchase'),
      type_of_property: QueryValidator.ensureSingleString(type_of_property, 'type_of_property'),
      neighborhood: QueryValidator.ensureSingleString(neighborhood, 'neighborhood'),
      municipality: QueryValidator.ensureSingleString(municipality, 'municipality'),
      min_price: QueryValidator.ensureSingleString(min_price, 'min_price'),
      max_price: QueryValidator.ensureSingleString(max_price, 'max_price'),
      is_negotiable: QueryValidator.ensureBoolean(is_negotiable,'is_negotiable'),
    };

    const limit = QueryValidator.ensurePositiveNumber(req.query.limit, 'limit') || 20;
    const lastPropertyId = QueryValidator.ensurePositiveNumber(req.query.cursor, 'cursor') || 0;

    const properties = await propertyService.searchListings(filters, limit, lastPropertyId);

    res.json({
      success: true,
      cursor: properties.cursor,
      properties: properties.properties,
    });
  } catch (error) {
    next(error);
  }
},
  updatePropertyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
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
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
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
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
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
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
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
      const profileId = req.accessUser?.profileId;
      const propertyId = Number(req.params.id);

      if (isNaN(propertyId) || propertyId <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);

      const result = await propertyService.deleteProperty(Number(profileId), Number(propertyId));
    
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
  addToFavorites: async (req: Request, res: Response, next: NextFunction) => {
    try{ 
      const profileId = req.accessUser?.profileId ;
      const property_id = Number(req.params.id);

      if (isNaN(property_id) || property_id <= 0) {
        throw new AppError("ID inválido!", 400);
      }

      if (!profileId) throw new AppError("Perfil não encontrado!", 404);
      
      if (!property_id) throw new AppError("ID da propriedade é obrigatório!", 400);


      const result = await propertyService.addToFavorites(Number(profileId), Number(property_id));
      res.json({ success: true, ...result });

    } catch (error) {
      next(error);
    }
  },
  removeFromFavorites: async (req: Request, res: Response, next: NextFunction) => {
    try{ 
      const profileId = req.accessUser?.profileId;
      const property_id = Number(req.params.id);

      if (isNaN(property_id) || property_id <= 0) {
        throw new AppError("ID inválido!", 400);
      }
      
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);
      if (!property_id) throw new AppError("ID da propriedade é obrigatório!", 400);

      const result = await propertyService.removeFromFavorites(Number(profileId), Number(property_id));
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
  getUserFavorites: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.accessUser?.profileId;
      const limit = req.query.limit || 20;
      const lastFavoriteId = req.query.cursor || 0;
      if (!profileId) throw new AppError("Perfil não encontrado!", 404);
      if (Array.isArray(limit)) throw new AppError("Valor inválido!", 400);
      if (Array.isArray(lastFavoriteId)) throw new AppError("Valor inválido!", 400);

      const favorites = await propertyService.getUserFavorites(Number(profileId), Number(limit), Number(lastFavoriteId));
      res.json({
        success: true,
        cursor: favorites.cursor,
        properties: favorites.properties,
      });
    } catch (error) {
      next(error);
    }
  }
}
