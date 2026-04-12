import type { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.services.js";
import { type AdminLoginDTO, createAdmin, type createAdminDTO } from "../dto/admin.dto.js";
import { createToJSONSchemaMethod } from "zod/v4/core";

export const adminController = {
    //Profiles
    findById: async(req:Request, res: Response, next : NextFunction) => {
        try{ 
            const id = req.params.id /* req.user!.sub */
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
    findAll: async (_: Request, res: Response, next : NextFunction) => {
      try {
        const users = await adminService.findProfiles();
  
        res.json({
          success: true,
          users
        });
      } catch (err) {
        next(err);
      }
    },
    banProfile: async(req: Request, res: Response, next: NextFunction) => {

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
