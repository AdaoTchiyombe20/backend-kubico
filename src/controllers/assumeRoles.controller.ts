import type { Response, Request, NextFunction } from "express"
import { type GetUserIdDTO, getUserId } from "../dto/user.dto.js"
import { assumeRolesServices } from "../services/assumeRoles.services.js"


export const assumeRolesController = {
    assumeClient: async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data : GetUserIdDTO = getUserId.parse({id: req.accessUser!.profileId})
            await assumeRolesServices.client(data.id)
            res.status(200).json({
                success: true,
                message: 'roles actualizadas com sucesso, chame a rota /refresh para gerar um novo access token e refresh token com a role activa'
            })
        }catch(error){
            next(error)
        }
    },
    assumeOwner: async(req: Request, res: Response, next: NextFunction) => {
       try{
            const data : GetUserIdDTO = getUserId.parse({id: req.accessUser!.profileId})
            await assumeRolesServices.owner(data.id)
            res.status(200).json({
                success: true,
                message: 'roles actualizadas com sucesso, chame a rota /refresh para gerar um novo access token e refresh token com a role activa'
            })
        }catch(error){
            next(error)
       }
    },
}
