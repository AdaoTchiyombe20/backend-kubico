


import { Router } from "express";
import { authController } from "../../controllers/auth.controller.js";
import { 
  authorizeRefreshTokenMiddleware, 
  UnauthorizeRefreshTokenMiddleware,
  verificationUserBanStatusMiddleware
} from "../../middlewares/auth.middleware.js"
import { loginRateLimiting } from "../../../lib/ratelimiting.js";

const authRouter = Router()

// ============================================
// ROTAS DE USUÁRIO NORMAL
// ============================================

// SignUp - Verifica se não está autenticado e não está banido
authRouter.post(
    '/signup/:type', 
  loginRateLimiting, 
  UnauthorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.signup
)

// Login - Verifica se não está autenticado e não está banido
authRouter.post(
  '/login', 
  loginRateLimiting,
  UnauthorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.login
)

// Logout - Requer autenticação e verifica ban
authRouter.get(
  '/logout', 
  authorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.logout
)

// Refresh - Requer autenticação e verifica ban
authRouter.get(
  '/refresh',
  authorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.refresh
)

// Verify Email - Verifica ban
authRouter.get(
  "/verify-email", 
  verificationUserBanStatusMiddleware,
  authController.verifyEmailController
)

// Send Verification Mail - Requer autenticação e verifica ban
authRouter.get(
  "/send-verify-mail", 
  authorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.sendMailVerification
)

// ============================================
// ROTAS DE ADMIN
// ============================================

// Create Admin - Verifica se não está autenticado e não está banido
authRouter.post(
  '/create-admin', 
  loginRateLimiting, 
  UnauthorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.createAdmin
)

// Login Admin - Verifica se não está autenticado e não está banido
authRouter.post(
  '/login-admin',
  loginRateLimiting,
  UnauthorizeRefreshTokenMiddleware, 
  verificationUserBanStatusMiddleware,
  authController.loginAdmin
)

export { authRouter }