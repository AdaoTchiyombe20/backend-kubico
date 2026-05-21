import { type Request, type Response, type NextFunction } from "express";
import { login, signup, type AuthLoginDTO, type AuthSignUpDTO } from "../dto/auth.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { authServices } from "../services/auth.services.js";
import { getUserId, type GetUserIdDTO } from "../dto/user.dto.js";
import { setCookie } from "../utils/cookies.js";
import type { ProfileType } from "@prisma/client";
import { createAdmin, type AdminLoginDTO, type createAdminDTO, loginAdmin} from "../dto/admin.dto.js";
import { adminService } from "../services/admin.services.js";


export const authController = {
  //admin
      createAdmin: async(req: Request, res: Response, next: NextFunction)=> {
        try{
          const data: createAdminDTO = createAdmin.parse({adminsName: req.body.adminsName, email: req.body.email, password: req.body.password, accessLevel: req.body.accessLevel.toUpperCase()})
          const {adminsName,email,password, accessLevel} = data
  
          const result = await adminService.createAdmin(adminsName,email, password, accessLevel)
          
        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.set('Authorization', `Bearer ${result.accessToken}`);
        
        setCookie(res, "refreshToken", result.refreshToken)

          res.json({
            success: true,
            ...result
          })
  
        }catch(error){
          next(error)
        }    
      },
      loginAdmin: async(req:Request, res: Response, next: NextFunction)=> {
        try{
          const data: AdminLoginDTO = loginAdmin.parse(req.body)
          const {email, password} = data
  
          const result = await adminService.login(email, password)
          
        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.set('Authorization', `Bearer ${result.accessToken}`);
        
        setCookie(res, "refreshToken", result.refreshToken)

          res.status(200).json({
            success: true,
            ...result
          })
        }catch(error){
          next(error)
        }
      },
  

  //Normal Users
    signup : async (req: Request, res: Response, next: NextFunction) => {
         try {
              const data: AuthSignUpDTO = signup.parse(req.body);
              const typeParam = req.params.type;
              if (!typeParam || Array.isArray(typeParam)) {
                throw new AppError('Invalid or missing profile type', 400);
              }
              const typeOfUser = typeParam.toUpperCase();
              const user = await authServices.signUp(data.email, data.password, typeOfUser as ProfileType);

              res.set('Access-Control-Expose-Headers', 'Authorization');
              res.set('Authorization', `Bearer ${user.accessToken}`);
              
              setCookie(res, "refreshToken", user.refreshToken)

              res.status(201).json({
                success: true,
                user: user.user,
                message: "Usuario criado com sucesso!",
                accessToken: user.accessToken
              });
            } catch (err) {
              next(err);
            }
    },
    login : async(req: Request, res: Response, next: NextFunction) => {
      try{
        const data: AuthLoginDTO = login.parse(req.body) 
        const {email, password} = data
        const user = await authServices.login({email, password})
        
        console.log('Login bem-sucedido:', { email, accessToken: user.accessToken, refreshToken: user.refreshToken });
        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.set('Authorization', `Bearer ${user.accessToken}`);
        
        setCookie(res, "refreshToken", user.refreshToken)

        res.status(200).json({
          message: "usuario com sessao iniciada!",
          user: user.user,
          accessToken: user.accessToken
        })

      }catch(err){
        next(err)
      }
    },
    logout: async(req: Request, res: Response, next: NextFunction) => {
      try{
        const refreshToken = req.cookies.refreshToken
        const logoutUser = await authServices.logout(refreshToken)

         res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: false,
          sameSite: 'strict'
        });

        res.json({
          message: logoutUser.message
        })
      }catch(err){
        next(err)
      }
    },
    refresh: async(req: Request, res: Response, next: NextFunction) => {
     try{
        const {id}: GetUserIdDTO = getUserId.parse({id: req.refreshUser!.sub})
        const refreshToken = req.cookies.refreshToken
        const refreshAcess = await authServices.refresh(id, refreshToken)

        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.set('Authorization', `Bearer ${refreshAcess.accessToken}`);
        setCookie(res, "refreshToken", refreshAcess.refreshToken)
        
        res.status(200).json({
          success: true,
          message: 'Acesso Actualizado',
          refreshAcess
        })
     }catch(error){
        next(error)
     }
    }, 
    verifyEmailController: async(req: Request, res: Response, next: NextFunction) => {
     try{
      const token = req.query.token as string;
    
      if (!token) 
        return new AppError('Token não fornecido', 400)
      
      const result = await authServices.verifyEmail(token);

      return res.json({ message: result.message,success: true });
      
    }catch(error){
        next(error)
    }
  },
  sendMailVerification: async(req: Request, res: Response,next: NextFunction)=> {
    try{
      const {id}: GetUserIdDTO = getUserId.parse({id: req.refreshUser!.sub})
      await authServices.sendVerificationEmail(id) 

      res.json({
        success: true,
        message: 'Email de verificacao enviado!'
      })
    }catch(error){
      next(error)
    }
  }
}
