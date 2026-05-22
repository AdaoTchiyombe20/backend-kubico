import type { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.services.js";
import { AppError } from "../errors/App.Errors.js";

export const adminController = {
    //Profiles
    findById: async(req:Request, res: Response, next : NextFunction) => {
        try{ 
            const id = req.params.id as string

            const user = await adminService.findProfileById(Number(id))

            res.json({
                sucess: true,
                message: 'usuario encontrado!',
                user
            })
        }catch(err){
            next(err)
        }
    },
    findAll: async (req: Request, res: Response, next : NextFunction) => {
      try {

        const limit = req.query.limit || 20;
        const lastPropertyId = req.query.cursor || 0;
          if (Array.isArray(limit)) throw new AppError("Valor inválido!", 400);
          if (Array.isArray(lastPropertyId)) throw new AppError("Valor inválido!", 400);

        const users = await adminService.findProfiles(Number(limit), Number(lastPropertyId));
  
        res.json({
          success: true,
          users
        });
      } catch (err) {
        next(err);
      }
    },
    banProfile: async(req: Request, res: Response, next: NextFunction) => {
      try{ 
        const id = req.params.id as string
        if(isNaN(Number(id))) throw new AppError("ID inválido!", 400)
        
        const user = await adminService.banProfile(Number(id)) 
          
      }catch(error){
        next(error)
      }
      
    },
    suspendProfile: async(req: Request, res: Response, next: NextFunction) => {

    },
    unBanProfile: async(req: Request, res: Response, next: NextFunction) => {

    },
    findVerifications: async(req: Request, res: Response, next: NextFunction) => {

    },
    approveProfiles: async(req: Request, res: Response, next: NextFunction) => {

    },
    rejectProfiles: async(req: Request, res: Response, next: NextFunction) => {

    },

    //Properties
    getPeddingProperties: async(req: Request, res: Response, next: NextFunction) => {

    },
    approveProperties: async(req: Request, res: Response, next: NextFunction) => {

    },
    rejectProperties: async(req: Request, res: Response, next: NextFunction) => {

    },

    //Plans
    createPlan: async(req: Request, res: Response, next: NextFunction) => {

    },
    editPlan: async(req: Request, res: Response, next: NextFunction) => {

    },
    deletePlan: async(req: Request, res: Response, next: NextFunction) => {

    },

} 
