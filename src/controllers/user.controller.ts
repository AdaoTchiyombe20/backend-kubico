import {updateUserPassword, type UpdateUserPassworsDTO, getUserId,type GetUserIdDTO,type UserUpdateEmailDTO,updateEmail, 
} from "../dto/user.dto.js";
import { userService } from "../services/user.services.js";
import { type NextFunction, type Request, type Response } from "express";

const userController = {
  delete: async(req: Request, res: Response, next : NextFunction) => {
    try{ 
        const data : GetUserIdDTO = getUserId.parse({id: req.refreshUser!.sub})
        await userService.deleteUser(data.id)
        res.json({
            success: true,
            message: "Usario Apagado!"
        })
    }catch (err) {
      next(err);
    }
  }, 
  updatePassword: async(req: Request, res: Response, next : NextFunction) => {
    try{
        const data: GetUserIdDTO = getUserId.parse(req.refreshUser!.sub)
        const dataToUpdate : UpdateUserPassworsDTO= updateUserPassword.parse(req.body)

        const password = await userService.updateUserPassword(data.id ,dataToUpdate.password)
        res.json({
            success : true, 
            message: 'Password Actualizada',
            password
        })
    }catch (err) {
      next(err);
    }
  },
  updateEmail: async(req:Request, res: Response, next : NextFunction) => {
    try{
      const data: GetUserIdDTO = getUserId.parse({id: req.refreshUser!.sub})
      const {email}: UserUpdateEmailDTO = updateEmail.parse({email: req.body.email})
      const user = await userService.updateEmail(data.id, email)
      res.json({
        success: true,
        message: 'email actualizado!',
        user
      }) 
    }catch(err){
      next(err)
    }
  },
  findUserById: async( req:Request, res: Response, next: NextFunction)=> {
    const data: GetUserIdDTO = getUserId.parse(req.refreshUser!.sub)
    const getUser = await userService.findUserById(data.id) 
  }
};

export { userController };
