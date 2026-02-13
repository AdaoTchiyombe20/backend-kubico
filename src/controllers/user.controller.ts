import { updateUser,type UserUpdateDTO,getUserId,type GetUserIdDTO,type UserUpdateEmailDTO,updateEmail,verifyclient, type VerifyOwnerDTO, type VerifyClientDTO, verifyOwner,
} from "../dto/user.dto.js";
import { AppError } from "../errors/App.Errors.js";
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
  update: async(req: Request, res: Response, next : NextFunction) => {
    try{
        const data: GetUserIdDTO = getUserId.parse(req.user!.sub)
        const dataToUpdate : UserUpdateDTO = updateUser.parse(req.body)

        const user = await userService.updateUser(data.id ,dataToUpdate)
        res.json({
            success : true, 
            message: 'Usuario Actualizado',
            user
        })
    }catch (err) {
      next(err);
    }
  },
  updateEmail: async(req:Request, res: Response, next : NextFunction) => {
    try{
      const data: GetUserIdDTO = getUserId.parse(req.user!.sub)
      const email: UserUpdateEmailDTO = updateEmail.parse({email: req.body.email})
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
  verifyClient: async(req: Request,res: Response, next : NextFunction) => {
    try{
      const id= req.user!.sub
      const data: VerifyClientDTO = verifyclient.parse(req.body);
      const client = await userService.verifyClient(Number(id), data);

      res.status(201).json({
        message: 'Cliente cadastrado! Aguarde a verificação dos dados.',
        client
      })
      
    }catch(error){
      next(error)
    }
  },
  verifyOwner: async(req: Request,res: Response, next : NextFunction) => {
    try{
      const id= req.user!.sub
      const data: VerifyOwnerDTO = verifyOwner.parse(req.body);
      const owner = await userService.verifyOwner(Number(id), data);

      res.status(201).json({
        message: 'Proprietario cadastrado! Aguarde a verificação dos dados.',
        owner
      })
      
    }catch(error){
      next(error)
    }
  },
};

export { userController };
