import "dotenv/config";
import { ENV } from "../config/env.js";
import type { AuthLoginDTO } from "../dto/auth.dto.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "../errors/App.Errors.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { authRepositories } from "../repositories/auth/auth.repositories.js";
import { refreshTokenUser } from "../repositories/auth/refreshToken.repositories.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import type { ProfileType } from "@prisma/client";

export const authServices = {
  signUp: async (email: string, password: string, typeOfUser: ProfileType) => {
    try {
      const userEmail = email.trim();
      const existingEmail = await authRepositories.findByEmail(userEmail);

      if (existingEmail) throw new AppError("Email já cadastrado!", 400);

      const passwordHash = await hashPassword(password);

      const user = await authRepositories.signUp({
        email: userEmail,
        password: passwordHash,
      });

      const userRestrictionHistory = await userRepository.createUserRestrictionHistory(
        user.id,
        "ACTIVE",
        null
      );

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
          ban_status: userRestrictionHistory.new_ban_status,
        },
        ENV.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      const accessToken = jwt.sign(
          {
            sub: String(user.id),
            profileId: profile.id,
            role: 'CLIENT',
            type: profile.type,
          },
          ENV.JWT_SECRET,
          { expiresIn: "15m" }
        );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      });

      return {
        user,
        refreshToken,
        accessToken,
        message: "Cliente criado com sucesso!",
      };
    } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erro ao fazer o signUp: ${error}`, 500);
    }
  },
  login: async (data: AuthLoginDTO) => {
    try {
      const { email, password } = data;
      const user = await authRepositories.findByEmail(email);

      if (!user) throw new AppError("Usuario não encontrado!", 404);

      const verfiryUserPassword = await comparePassword(
        password,
        user.password,
      );

      if (!verfiryUserPassword) throw new AppError("Dados Incorretos!", 401);

      let profile = await profileRepository.findAuthProfileByUserId(user.id);

      if (!profile) {
        profile = await profileRepository.createProfile(user.id, "INDIVIDUAL");
      }

      let clientRole = await profileRole.findProfileRoleByRole(profile.id, 1);
      if (!clientRole) {
        clientRole = await profileRole.insertValues(profile.id, 1, "APPROVED");
      }

      let userRestrictionHistory = await userRepository.getCurrentUserRestrictionHistory(user.id);
      if(!userRestrictionHistory) {
        userRestrictionHistory = await userRepository.createUserRestrictionHistory(
          user.id,
          "ACTIVE",
          null
        );
      }
      if ( userRestrictionHistory.new_ban_status === "BANNED") {
        throw new AppError("Usuário banido!", 403);
      }
      if (
        userRestrictionHistory.new_ban_status === "SUSPENDED"
      ) {
        throw new AppError("Usuário suspenso!", 403);
      }

      const refreshToken = jwt.sign(
        {
          sub: user.id,
          ban_status: userRestrictionHistory.new_ban_status,
        },
        ENV.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      const accessToken = jwt.sign(
        {
          sub: String(user.id),
          profileId: profile.id,
          role: "CLIENT",
          type: profile.type,
        },
        ENV.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      });

      await userRepository.updateStatus(user.id, true, null);
      if (!clientRole.is_active) {
        await profileRole.updateProfileRoleStatus(profile.id, 1, true);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        refreshToken,
        accessToken,
      };
    } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erro ao fazer o signUp: ${error}`, 500);
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
      const tokenVerification = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

      if (!tokenVerification)
        throw new AppError("Token Invalido ou expirado!", 401);
      const userId = tokenVerification.sub;

      const getUser = await userRepository.findById(Number(userId));

      if (!getUser) throw new AppError("Usuario usuario nao encontrado", 404);

      if (getUser.email_verified) {
        throw new AppError("Email já verificado!", 400);
      }
      
      await userRepository.update(getUser.id, { email_verified: true });
      return { message: "Email verificado com sucesso!" };
    
    } catch (error) {
      throw new AppError(`Erro ao verificar o email: ${error}`, 400);
    }
  },
  refresh: async (id: number, refreshTkn: string) => {
    try {
      const findProfile = await profileRepository.findAuthProfileByUserId(id);

      if (!findProfile) throw new AppError("Perfil nao encontrado!", 404);

      const profileRoles = await profileRole.findAllRolesByProfileId(findProfile.id);

      if (!refreshTkn) throw new AppError("Refresh token nao fornecido!", 400);

      if (!profileRoles) throw new AppError("Id nao cadastrado!!", 401);

      const revokedToken = await refreshTokenUser.revokeRefreshToken(refreshTkn);

      const user = await userRepository.findById(id);

      if (!user) throw new AppError("Usuario nao encotrado!", 404);

      const verifyActiveRole = profileRoles.find(
        (profile: any) => profile.is_active == true,
      );

      if (!verifyActiveRole) throw new AppError("Nenhuma Role activa!", 404);

      const profile = await profileRepository.findAuthProfileByUserId(user.id);

      if (!profile) throw new AppError("Profile nao encontrado!", 400);

      const refreshToken = jwt.sign(
        {
          sub: user.id,
        },
        ENV.JWT_REFRESH_SECRET,
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
          sub: String(user.id),
          profileId: profile.id,
          role: roleName,
          type: profile.type,
        },
        ENV.JWT_SECRET,
        { expiresIn: "15m" }
      );;

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
        revokedToken
      };
    } catch (error) {
      throw new AppError(`Erro no refresh: ${error}`, 400);
    }
  },
  sendVerificationEmail: async (id: number) => {
    try {
      const findUser = await userRepository.findById(id);

      if (!findUser?.email_verified) {
        return { message: "Envio de email de verificação ignorado." };
      } else {
        throw new AppError("Email ja verificado!", 400);
      }
    } catch (error) {
      throw new AppError(`Erro ao enviar o email de verificação: ${error}`, 400);
    }
  },
};
