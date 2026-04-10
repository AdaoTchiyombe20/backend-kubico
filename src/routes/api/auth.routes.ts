import { Router } from "express";
import { authController } from "../../controllers/auth.controller.js";
import { authorizeRefreshTokenMiddleware, UnauthorizeRefreshTokenMiddleware } from "../../middlewares/auth.middleware.js"
import { loginRateLimiting } from "../../../lib/ratelimiting.js";

const authRouter = Router()
//normal user
authRouter.post('/signup/:type', loginRateLimiting, UnauthorizeRefreshTokenMiddleware, authController.signup)
authRouter.post('/login', UnauthorizeRefreshTokenMiddleware, authController.login)
authRouter.get('/logout', authorizeRefreshTokenMiddleware, authController.logout)
authRouter.get('/refresh',authorizeRefreshTokenMiddleware, authController.refresh)
authRouter.get("/verify-email", authController.verifyEmailController);
authRouter.get("/send-verify-mail", authController.sendMailVerification);

//admin
//auth
authRouter.post('/create-admin', authController.createAdmin)
authRouter.post('/login', authController.login)
export {authRouter}