import { type Request, type Response, type NextFunction } from "express";
import { login, signup, type AuthLoginDTO, type AuthSignUpDTO } from "../dto/auth.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { authServices } from "../services/auth.services.js";
import { getUserId, type GetUserIdDTO } from "../dto/user.dto.js";
import { setCookie } from "../utils/cookies.js";


export const authController = {
    signup : async (req: Request, res: Response, next: NextFunction) => {
         try {
              const data: AuthSignUpDTO = signup.parse(req.body);
              const user = await authServices.signUp(data);

              res.set('Access-Control-Expose-Headers', 'Authorization');
              
              setCookie(res, "refreshToken", user.refreshToken)

              res.status(201).json({
                success: true,
                user: user.user
              });
            } catch (err) {
              next(err);
            }
    }, //registra com email_Verified: false
    login : async(req: Request, res: Response, next: NextFunction) => {
      try{
        const data: AuthLoginDTO = login.parse(req.body) 
        const {email, password} = data
        const user = await authServices.login({email, password})

        
        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.set('Authorization', `Bearer ${user.accessToken}`);
        
        setCookie(res, "refreshToken", user.refreshToken)

        res.status(200).json({
          message: "usuario com sessao inicia!",
          user: user.user
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
        const {id}: GetUserIdDTO = getUserId.parse({id: req.user!.sub})
        const refreshToken = req.cookies.refreshToken
        const refreshAcess = await authServices.refresh(id, refreshToken)

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
     const token = req.query.token as string;
    
      if (!token) 
        return new AppError('Token não fornecido', 400)
      
      await authServices.verifyEmail(token);

      return res.send("Email verificado com sucesso");
    },
}
