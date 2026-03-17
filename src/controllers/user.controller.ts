import {updateUserPassword, type UpdateUserPassworsDTO, getUserId,type GetUserIdDTO,type UserUpdateEmailDTO,updateEmail, 
} from "../dto/user.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { userService } from "../services/user.services.js";
import { type NextFunction, type Request, type Response } from "express";

const userController = {
  delete: async(req: Request, res: Response, next : NextFunction) => {
    try{ 
        const data : GetUserIdDTO = getUserId.parse({id: req.user!.sub})
        const user = await userService.deleteUser(data.id)
        res.json({
            success: true,
            message: "Usario Apagado!",
            data: user
        })
    }catch (err) {
      throw new AppError(`Erro no controller ${err}`, 400);
    }
  }, 
  updatePassword: async(req: Request, res: Response, next : NextFunction) => {
    try{
        const data: GetUserIdDTO = getUserId.parse(req.user!.sub)
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
      const data: GetUserIdDTO = getUserId.parse(req.user!.sub)
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
};

export { userController };
