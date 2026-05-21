import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/App.Errors.js";
import "dotenv/config";
import { ENV } from "../config/env.js";
import { refreshTokenUser } from "../repositories/auth/refreshToken.repositories.js";
import { UserBanStatus } from "@prisma/client";
import type { JwtPayload } from "jsonwebtoken";
import { userRepository } from "../repositories/auth/user.repositories.js";

interface TokenPayload {
  sub: string;
}

interface AccessTokenPayload {
  sub: string;
  profileId: string;
  role: string;
  iat: number;
  type: string;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      refreshUser?: TokenPayload;
      accessUser?: AccessTokenPayload;
    }
  }
}

export const authorizeRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(
        new AppError(
          "Refresh Token não fornecido!",
          401
        )
      );
    }

    const decoded = jwt.verify(
      token,
      ENV.JWT_REFRESH_SECRET
    ) as JwtPayload;

    if (!decoded.sub) {
      return next(
        new AppError("Token inválido!", 401)
      );
    }

    req.refreshUser = {
      sub: String(decoded.sub),
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError("Token inválido!", 401)
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError("Sessão expirada!", 401)
      );
    }

    next(error);
  }
};
export const UnauthorizeRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) return next();

    const decoded = jwt.verify(
  token,
  ENV.JWT_REFRESH_SECRET
) as JwtPayload;

const userId = Number(decoded.sub);

const restriction =
  await userRepository.getCurrentUserRestrictionHistory(userId);

if (!restriction) {
  return next(new AppError("Restrição não encontrada", 403));
}

if (restriction.new_ban_status === "BANNED") {
  return next(new AppError("Usuário banido!", 403));
}

if (restriction.new_ban_status === "SUSPENDED") {
  return next(new AppError("Usuário suspenso!", 403));
}

    const tokenExists = await refreshTokenUser.findRefreshToken(token);

    if (!tokenExists || tokenExists.revokedAt) {
      res.clearCookie("refreshToken");
      return next();
    }

    if (tokenExists.expiresAt < new Date()) {
      res.clearCookie("refreshToken");
      return next();
    }

    return next(new AppError("Você já está autenticado!", 400));
  } catch (err) {
    if (
      err instanceof jwt.JsonWebTokenError ||
      err instanceof jwt.TokenExpiredError
    ) {
      res.clearCookie("refreshToken");
      return next();
    }
    next(err);
  }
};

export const authorizeNormalAccessTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const headersToken = req.headers.authorization;

    if (!headersToken || !headersToken.startsWith("Bearer "))
      return next(new AppError("Access Token não fornecido!", 401));

    const accessToken = headersToken.split(" ")[1];

    if (!accessToken) return next(new AppError("Access token Inválido!", 401));

    const decoded = jwt.verify(accessToken, ENV.JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      return next(new AppError("Token inválido", 401));
    }

    const payload = decoded as JwtPayload;

    if (
      !payload.sub ||
      !payload.type ||
      !payload.role ||
      payload.iat === undefined ||
      payload.exp === undefined
    ) {
      return next(new AppError("Token payload incompleto", 401));
    }

    const accessPayload: AccessTokenPayload = {
      sub: payload.sub as string,
      profileId: (payload as any).profileId as string,
      role: payload.role,
      iat: payload.iat,
      type: payload.type,
      exp: payload.exp,
    };

    req.accessUser = accessPayload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Token inválido!", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Sessão expirada!", 401));
    }
    return next(error);
  }
};

export function authorizeRoleAcessTokenMiddleware(allowedRole: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.accessUser || !("role" in req.accessUser)) {
        return next(new AppError("Role não encontrada", 400));
      }

      const userRole = req.accessUser?.role;

      if (!userRole) return next(new AppError("Roles não encontradas", 403));

      const hasPermission = allowedRole.some((role) =>
        userRole.includes(role.toUpperCase()),
      );

      if (!hasPermission) return next(new AppError("Acesso negado", 403));

      next();
    } catch (err) {
      next(err);
    }
  };
}

// ============================================
// FUNÇÃO PARA REATIVAR USUÁRIO SE SUSPENSÃO EXPIROU
// ============================================
const reactivateIfExpired = async (id: number) => {
  try {
    if (isNaN(id)) throw new AppError("ID inválido!", 400);
    if (!id) throw new AppError("ID não fornecido!", 400);

    const profile = await userRepository.findById(id);
    if (!profile) throw new AppError("Usuario não encontrado!", 404);

    const findUserRestrictionHistory = await userRepository.getCurrentUserRestrictionHistory(profile.id);
    if (!findUserRestrictionHistory) throw new AppError("O perfil não possui histórico de restrições!", 400);

    // Verifica se está suspenso E se os 7 dias já passaram
    if (
      findUserRestrictionHistory.new_ban_status === UserBanStatus.SUSPENDED &&
      findUserRestrictionHistory.ended_at &&
      new Date() >= findUserRestrictionHistory.ended_at
    ) {
      // Desativa a suspensão anterior
      await userRepository.updateUserRestrictionHistory(
        findUserRestrictionHistory.id,
        new Date()
      );

      // Cria novo histórico com status ACTIVE
      await userRepository.createUserRestrictionHistory(
        profile.id,
        UserBanStatus.ACTIVE,
        null
      );

      return true; // Indica que foi reativado
    }

    return false; // Não foi reativado
  } catch (error) {
    // Loga o erro mas não bloqueia o middleware
    console.error("Erro ao reativar usuário:", error);
    return false;
  }
};

// ============================================
// MIDDLEWARE DE VERIFICAÇÃO DE BAN
// ============================================
export const verificationUserBanStatusMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) return next();

    const decoded = jwt.verify(
      token,
      ENV.JWT_REFRESH_SECRET
    ) as JwtPayload;

    const userId = Number(decoded.sub);

    // PRIMEIRO tenta reativar
    await reactivateIfExpired(userId);

    // DEPOIS lê o estado atualizado
    const restriction =
      await userRepository.getCurrentUserRestrictionHistory(userId);

    if (!restriction) {
      return next(new AppError("Restrição não encontrada", 403));
    }

    if (restriction.new_ban_status === "BANNED") {
      return next(new AppError("Usuário banido!", 403));
    }

    if (restriction.new_ban_status === "SUSPENDED") {
      return next(new AppError("Usuário suspenso!", 403));
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Token inválido!", 401));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Sessão expirada!", 401));
    }

    return next(error);
  }
};

// Exporta a função para uso em outros locais se necessário
export { reactivateIfExpired };