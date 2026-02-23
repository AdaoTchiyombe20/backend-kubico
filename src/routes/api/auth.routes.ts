import { Router } from "express";
import { authController } from "../../controllers/auth.controller.js";
import { authorizeRefreshTokenMiddleware, UnauthorizeRefreshTokenMiddleware } from "../../middlewares/auth.middleware.js"
import { loginRateLimiting } from "../../../lib/ratelimiting.js";

const authRouter = Router()

authRouter.post('/signup', loginRateLimiting, UnauthorizeRefreshTokenMiddleware, authController.signup)
authRouter.post('/login', UnauthorizeRefreshTokenMiddleware, authController.login)
authRouter.post('/logout', authorizeRefreshTokenMiddleware, authController.logout)
authRouter.post('/refresh',authorizeRefreshTokenMiddleware, authController.refresh)

authRouter.get("/auth/verify-email/:token", authController.verifyEmailController);

export {authRouter}