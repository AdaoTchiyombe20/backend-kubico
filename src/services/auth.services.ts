import "dotenv/config";
import { env } from "prisma/config";
import type { AuthLoginDTO } from "../dto/auth.dto.js";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/App.Errors.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { authRepositories } from "../repositories/auth/auth.repositories.js";
import { refreshTokenUser } from "../repositories/auth/refreshToken.repositories.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { sendVerificationEmail } from "./mail.services.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import type { ProfileType } from "../../generated/prisma/index.js";

export const authServices = {
  signUp: async (email: string, password: string, typeOfUser: ProfileType) => {
    try {
      const userEmail = email.trim();
      const existingEmail = await authRepositories.findByEmail(userEmail);

      if (existingEmail) throw new AppError("Email já cadastrado!!", 400);

      const passwordHash = await hashPassword(password);

      const user = await authRepositories.signUp({
        email: userEmail,
        password: passwordHash,
      });

      const profile = await profileRepository.createProfile(
        user.id,
        typeOfUser,
      );

      await profileRole.insertValues(
        profile.id,
        1, //client
        "APPROVED",
      );
      const refreshToken = jwt.sign(
        {
          sub: user.id,
        },
        env("JWT_REFRESH_SECRET"),
        { expiresIn: "7d" },
      );

      const accessToken = jwt.sign(
        {
          sub: profile.id,
          role: "CLIENT",
          iat: Math.floor(Date.now() / 1000),
          type: profile.type,
        },
        env("JWT_SECRET"),
        { expiresIn: "15m" },
      );

      const verifyEmailToken = jwt.sign(
        {
          iss: "kubico-api",
          sub: user.id,
          iat: Math.floor(Date.now() / 1000),
          aud: user.email,
        },
        env("JWT_SECRET"),
        {
          expiresIn: "15m",
        },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      });

      if (!user.email_verified)
        await sendVerificationEmail(user.email, verifyEmailToken);

      return {
        user,
        refreshToken,
        accessToken,
        message: "Cliente criado com sucesso!",
      };
    } catch (error) {
      throw new AppError(`Erro ao fazer o signUp: ${error}`, 400);
    }
  },
  login: async (data: AuthLoginDTO) => {
    try {
      const { email, password } = data;
      const user = await authRepositories.findByEmail(email);

      if (!user) throw new AppError("Usuario nao encontrado!!", 404);

      const verfiryUserPassword = await comparePassword(
        password,
        user.password,
      );

      if (!verfiryUserPassword) throw new AppError("senha incorreta!!", 401);

      if (!user.email_verified) throw new AppError("Valide o seu email", 400);

      const profile = await profileRepository.findByUserId(user.id);

      if (!profile) throw new AppError("Profile nao encontrado!", 400);

      const refreshToken = jwt.sign(
        {
          sub: user.id,
        },
        env("JWT_REFRESH_SECRET"),
        { expiresIn: "7d" },
      );

      const accessToken = jwt.sign(
        {
          sub: profile.id,
          role: "CLIENT",
          iat: Math.floor(Date.now() / 1000),
          type: profile.type,
        },
        env("JWT_SECRET"),
        { expiresIn: "15m" },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      });

      await userRepository.updateStatus(user.id, true, null);
      await profileRole.updateProfileRoleStatus(profile.id, 1, true);

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        refreshToken,
        accessToken,
      };
    } catch (error) {
      throw new AppError(`Erro ao fazer login: ${error}`, 400);
    }
  },
  logout: async (refreshToken: string) => {
    try {
      if (!refreshToken)
        throw new AppError("Refresh token nao fornecido!", 400);

      const token = await refreshTokenUser.revokeRefreshToken(refreshToken);
      const id = token!.user_id;

      await userRepository.updateStatus(id, false, new Date());
      await profileRole.updateAllProfileRolesStatus(id, false);
      return { message: "Logout Realizado com Sucesso!" };
    } catch (error) {
      throw new AppError(`Erro ao fazer o logout: ${error}`, 400);
    }
  },
  verifyEmail: async (token: string) => {
    try {
      const tokenVerification = jwt.decode(token);

      if (!tokenVerification)
        throw new AppError("Token Invalido ou expirado!", 401);
      const userId = tokenVerification.sub;

      const getUser = await userRepository.findById(Number(userId));

      if (!getUser) throw new AppError("Usuario usuario nao encontrado", 404);

      getUser.email_verified = true;

      await userRepository.update(getUser.id, { email_verified: true });
    } catch (error) {
      throw new AppError(`Erro ao verificar o email: ${error}`, 400);
    }
  },
  refresh: async (id: number, refreshTkn: string) => {
    try {
      const profileRoles = await profileRole.findAllRolesByProfileId(id);

      if (!refreshTkn) throw new AppError("Refresh token nao fornecido!", 400);

      if (!profileRoles) throw new AppError("Id nao cadastrado!!", 401);

      await refreshTokenUser.revokeRefreshToken(refreshTkn);

      const user = await userRepository.findById(id);

      if (!user) throw new AppError("Usuario nao encotrado!", 404);

      const verifyActiveRole = profileRoles.find(
        (profile: any) => profile.is_active == true,
      );

      if (!verifyActiveRole) throw new AppError("Nenhuma Role activa!", 404);

      const profile = await profileRepository.findByUserId(user.id);

      if (!profile) throw new AppError("Profile nao encontrado!", 400);

      const refreshToken = jwt.sign(
        {
          sub: user.id,
        },
        env("JWT_REFRESH_SECRET"),
        { expiresIn: "7d" },
      );

      const roleMap: { [key: number]: string } = {
        1: "CLIENT",
        2: "OWNER",
        3: "ADMIN",
      };

      const roleName = roleMap[verifyActiveRole.role_id];

      if (!roleName) {
        throw new AppError("Role Id invalida!", 400);
      }

      const accessToken = jwt.sign(
        {
          sub: user.id,
          role: roleName,
          iat: Math.floor(Date.now() / 1000),
          type: profile.type,
        },
        env("JWT_SECRET"),
        { expiresIn: "15m" },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      });

      return {
        refreshToken,
        accessToken,
      };
    } catch (error) {
      throw new AppError(`Erro no refresh: ${error}`, 400);
    }
  },
  sendVerificationEmail: async (id: number) => {
    try {
      const findUser = await userRepository.findById(id);
      const verifyEmailToken = jwt.sign(
        {
          iss: "kubico-api",
          sub: id,
          iat: Math.floor(Date.now() / 1000),
          aud: findUser!.email,
        },
        env("JWT_SECRET"),
        {
          expiresIn: "15m",
        },
      );

      if (!findUser?.email_verified) {
        await sendVerificationEmail(findUser!.email, verifyEmailToken);
      } else {
        throw new AppError("Email ja verificado!", 400);
      }
    } catch (error) {
      throw new AppError("Erro: ao enviar o email de verificação", 400);
    }
  },
};
