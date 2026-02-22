import { prisma } from "../../../lib/prisma.js";
import { AppError } from "../../errors/App.Errors.js";
import type { refresh_tokens } from "../../../generated/prisma/index.js";
export const refreshTokenUser = {
  findRefreshToken: async (token: string) => {
    return await prisma.refresh_tokens.findUnique({
      where: { token },
    });
  },

  saveRefreshToken: async (data: {
    refreshToken: string;
    userId: number;
    expiresAt: Date;
  }): Promise<refresh_tokens> => {
    return prisma.refresh_tokens.create({
      data: {
        token: data.refreshToken,
        user_id: data.userId,
        expiresAt: data.expiresAt,
        isActive: true,
      },
    });
  },

  revokeRefreshToken: async (token: string): Promise<refresh_tokens | null> => {
    const tokenExists = await prisma.refresh_tokens.findUnique({
      where: { token },
    });

    if (!tokenExists) {
      throw new AppError("Token não encontrado no banco de dados!", 404);
    }

    return await prisma.refresh_tokens.update({
      where: { token },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  },

  revokeRefreshTokenSafe: async (token: string): Promise<number> => {
    const result = await prisma.refresh_tokens.updateMany({
      where: { token },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
    return result.count;
  },
};
