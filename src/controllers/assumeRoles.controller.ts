import type { Response, Request, NextFunction } from "express"
import { type GetUserIdDTO, getUserId } from "../dto/user.dto.js"
import { assumeRolesServices } from "../services/assumeRoles.services.js"

export const assumeRolesController = {
    assumeClient: async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data : GetUserIdDTO = getUserId.parse(req.user!.sub)
            await assumeRolesServices.client(data.id)
            res.status(204)
            
        }catch(error){
            next(error)
        }
    },
    assumeOwner: async(req: Request, res: Response, next: NextFunction) => {
       try{
            const data : GetUserIdDTO = getUserId.parse(req.user!.sub)
            await assumeRolesServices.owner(data.id)
            res.status(204)
        
       }catch(error){
            next(error)
       }
    },
}