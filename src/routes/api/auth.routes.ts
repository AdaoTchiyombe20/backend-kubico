import { Router } from "express";
import { authController } from "../../controllers/auth.controller.js";
import { authorizeRefreshTokenMiddleware, UnauthorizeRefreshTokenMiddleware } from "../../middlewares/auth.middleware.js"
import { loginRateLimiting } from "../../../lib/ratelimiting.js";

const authRouter = Router()

authRouter.post('/signup/:type', loginRateLimiting, UnauthorizeRefreshTokenMiddleware, authController.signup)
authRouter.post('/login', UnauthorizeRefreshTokenMiddleware, authController.login)
authRouter.get('/logout', authorizeRefreshTokenMiddleware, authController.logout)
authRouter.get('/refresh',authorizeRefreshTokenMiddleware, authController.refresh)
authRouter.get("/verify-email", authController.verifyEmailController);

export {authRouter}