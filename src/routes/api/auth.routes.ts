


import { Router } from "express";
import { authController } from "../../controllers/auth.controller.js";
import { 
  authorizeRefreshTokenMiddleware, 
  UnauthorizeRefreshTokenMiddleware
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
  authController.signup
)

// Login - Verifica se não está autenticado e não está banido
authRouter.post(
  '/login', 
  loginRateLimiting,
  UnauthorizeRefreshTokenMiddleware, 
  authController.login
)

// Logout - Requer autenticação e verifica ban
authRouter.get(
  '/logout',
  authorizeRefreshTokenMiddleware,
  authController.logout
)

// Refresh - Requer autenticação e verifica ban
authRouter.get(
  '/refresh',
  authorizeRefreshTokenMiddleware,
  authController.refresh
)

// Verify Email - Verifica ban
authRouter.get(
  "/verify-email", 
  authController.verifyEmailController
)

// Send Verification Mail - Requer autenticação e verifica ban
authRouter.get(
  "/send-verify-mail", 
  authorizeRefreshTokenMiddleware, 
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
  authController.createAdmin
)

// Login Admin - Verifica se não está autenticado e não está banido
authRouter.post(
  '/login-admin',
  loginRateLimiting,
  UnauthorizeRefreshTokenMiddleware, 
  authController.loginAdmin
)

export { authRouter }