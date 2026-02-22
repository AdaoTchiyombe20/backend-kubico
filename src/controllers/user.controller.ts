import {updateUserPassword, type UpdateUserPassworsDTO, getUserId,type GetUserIdDTO,type UserUpdateEmailDTO,updateEmail, 
} from "../dto/user.dto.js";
import { userService } from "../services/user.services.js";
import { type NextFunction, type Request, type Response } from "express";

const userController = {
  findAll: async (_: Request, res: Response, next : NextFunction) => {
    try {
      const users = await userService.findUsers();

      res.json({
        success: true,
        users
      });
    } catch (err) {
      next(err);
    }
  },
  delete: async(req: Request, res: Response, next : NextFunction) => {
    try{ 
      const data : GetUserIdDTO = getUserId.parse(req.user!.sub)
        const user = await userService.deleteUser({id: data.id})
        res.json({
            success: true,
            message: "Usario Apagado!",
            data: user
        })
    }catch (err) {
      next(err);
    }
  }, 
  updatePassword: async(req: Request, res: Response, next : NextFunction) => {
    try{
        const data: GetUserIdDTO = getUserId.parse(req.user!.sub)
        const dataToUpdate : UpdateUserPassworsDTO= updateUserPassword.parse(req.body)

        const password = await userService.updateUserPassword(data.id ,dataToUpdate)
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
      const email: UserUpdateEmailDTO = updateEmail.parse({email: req.body.email})
      /* const user = await userService.updateEmail(data.id, email)
      res.json({
        success: true,
        message: 'email actualizado!',
        user
      })  */
    }catch(err){
      next(err)
    }
  },
  findById: async(req:Request, res: Response, next : NextFunction) => {
   try{ 
    const id = req.user!.sub
    const user = await userService.findUserById(Number(id))

    res.json({
        sucess: true,
        message: 'usuario encontrado!',
        user
    })
  }catch(err){
    next(err)
  }
  },
};

export { userController };
