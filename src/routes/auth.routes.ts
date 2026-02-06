import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authorizeRefreshTokenMiddleware, UnauthorizeRefreshTokenMiddleware } from "../middlewares/auth.middleware.js"

const authRouter = Router()

authRouter.post('/signup', UnauthorizeRefreshTokenMiddleware, authController.signup)
authRouter.post('/login', UnauthorizeRefreshTokenMiddleware, authController.login)
authRouter.post('/logout', authorizeRefreshTokenMiddleware, authController.logout)
authRouter.post('/refresh',authorizeRefreshTokenMiddleware, authController.refresh)
/* authRouter.post('/assume-client', authController.assumeClient)
authRouter.post('/assume-owner', authController.assumeOwner) */

authRouter.get("/auth/verify-email/:token", authController.verifyEmailController);

export {authRouter}