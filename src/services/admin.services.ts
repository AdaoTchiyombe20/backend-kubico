import "dotenv/config";
import { ENV } from "../config/env.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import { AppError } from "../errors/App.Errors.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { authRepositories } from "../repositories/auth/auth.repositories.js";
import { adminRepository } from "../repositories/admin/admin.respositories.js";
import type { AccessLevel } from "@prisma/client";
import { sendVerificationEmail } from "./mail.services.js";
import jwt from "jsonwebtoken";
import { refreshTokenUser } from "../repositories/auth/refreshToken.repositories.js";

export const adminService = {
  //auth
  createAdmin: async (
    adminsName: string,
    email: string,
    adminPassword: string,
    accessLevel: AccessLevel,
  ) => {
    try {
      const verifyEmail = await userRepository.findByEmail(email);

      if (verifyEmail) throw new AppError("This e-mail alredy exist", 400);

      const password = await hashPassword(adminPassword);

      const createuser = await authRepositories.signUp({ email, password });

      const createAdminProfile = await profileRepository.createProfile(
        createuser.id,
        "INDIVIDUAL",
      );

      const createAdminRole = await profileRole.insertValues(
        createAdminProfile.id,
        3,
        "APPROVED",
      );

      await adminRepository.createAdmin(
        createuser.id,
        adminsName,
        createAdminRole.id,
        accessLevel,
      );

      const emailVerificatioTonken = jwt.sign(
        {
          iss: "kubico-api",
          sub: createuser.id,
          iat: Math.floor(Date.now() / 1000),
          aud: email,
        },
        ENV.JWT_SECRET,
        {
          expiresIn: "15m",
        },
      );
      

      const refreshToken = jwt.sign(
              {
                sub: createuser.id,
              },
              ENV.JWT_REFRESH_SECRET,
              { expiresIn: "7d" },
            );
      
      const accessToken = jwt.sign(
        {
          sub: createAdminProfile.id,
          role: "CLIENT",
          iat: Math.floor(Date.now() / 1000),
          type: createAdminProfile.type,
        },
        ENV.JWT_SECRET,
        { expiresIn: "15m" },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: createuser.id,
        expiresAt: expiresAt,
      });
       if (!createuser.email_verified)
        await sendVerificationEmail(createuser.email, emailVerificatioTonken);


      return { accessToken, refreshToken, message: "Admin criado com sucesso!" };

    } catch (error) {
      throw new AppError(`Error: ${error}`);
    }
  },
  login: async (email: string, password: string) => {
    try {
      const findEmail = await userRepository.findByEmail(email);

      if (!findEmail) throw new AppError("User not Found", 404);

      if (!findEmail.email_verified) throw new AppError("Valide o seu email", 400);

      const findProfileById = await profileRepository.findByUserId(
        findEmail.id,
      );

      if (!findProfileById) throw new AppError("Profile not Found!", 404);

      const verifyAdmin = await profileRole.findProfileRoleByRole(
        findProfileById.id,
        3,
      );

      if(!verifyAdmin) throw new AppError("Admin not found!", 404)
      if(verifyAdmin?.status !== "APPROVED") throw new AppError("Admin nao aprovado!", 403)

      const verifiyPassword = comparePassword(password, findEmail!.password);

      if (!verifiyPassword) throw new AppError("Wrong password!", 401);

      const refreshToken = jwt.sign(
        {
          sub: findEmail.id,
        },
        ENV.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );
      const accessToken = jwt.sign(
        {
          sub: findProfileById.id,
          role: "ADMIN",
          iat: Math.floor(Date.now() / 1000),
          type: findProfileById.type,
        },
        ENV.JWT_SECRET,
        { expiresIn: "15m" },
      );
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await refreshTokenUser.saveRefreshToken({
        refreshToken,
        userId: findEmail.id,
        expiresAt: expiresAt,
      });
      return { accessToken, refreshToken, message: "Admin com sessao iniciada!" };
    } catch (error) {
      throw new AppError(`Erro ao entrar como admin: ${error}`, 400);
    }
  },
  findAdmin: async (adminRoleId: number, userId: number)=> {
    try{
      const findAdmin = await adminRepository.findAdmin(adminRoleId, userId)
      if(!findAdmin) throw new AppError('Admin nao encontrado', 404)
      return findAdmin
    
    }catch(error){
      throw new AppError(`Erro ao procurar por admin: ${error}`)
    }
  },
  //Profiles
  findProfiles: async () => {
    return await profileRepository.findAll();
  },
  findProfileById: async (id: number) => {
    const profile = await profileRepository.findById(id);

    if (!profile) throw new AppError("Perfil Inexistente!!!", 400);

    return profile;
  },
  findVerifications: async () => {},
  approveProfiles: async () => {},
  rejectProfiles: async () => {},

  //Properties
  getPeddingProperties: async () => {},
  approveProperties: async () => {},
  rejectProperties: async () => {},

  //Plans
  createPlan: async () => {},
  editPlan: async () => {},
  deletePlan: async () => {},
};
