import "dotenv/config";
import { ENV } from "../config/env.js";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/App.Errors.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import { hashPassword } from "../utils/hash.js";
import { sendVerificationEmail } from "./mail.services.js";
import { threadCpuUsage } from "node:process";

export const userService = {
  deleteUser: async (id: number) => {
    try {
      const existingId = await userRepository.findById(id);

      if (!existingId) throw new AppError("User não cadastrado!!", 404);

      return await userRepository.delete(id);
    } catch (error) {
      throw new AppError(`Erro: ${error}`, 400);
    }
  },
  updateUserPassword: async (id: number, password: string) => {
    try {
      const existingUser = await userRepository.findById(id);

      if (!existingUser) throw new AppError("Usuario não cadastrado!!", 404);

      if (!password) throw new AppError("Password inválida!", 400);

      const hashed = await hashPassword(password);

      return await userRepository.updatePassword(id, hashed);
    } catch (error) {
      throw new AppError(`Erro: ${error}`, 400);
    }
  },
  findUsers: async () => {
    return await userRepository.findAll();
  },
  findUserById: async (id: number) => {
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id inesistente!!!", 400);

    return existingId;
  },
  updateEmail: async (id: number, email: string) => {
    try {
      const existingUser = await userRepository.findById(id);
      const verifyEmail = await userRepository.findByEmail(email);

      if (!existingUser) throw new AppError("Usuario nao encontrado!", 404);

      if (email === existingUser.email)
        throw new AppError("Novo e-mail deve ser diferente do antigo!", 400);

      if (verifyEmail) throw new AppError("Email ja cadastrado!", 400);

      const updatingEmail = await userRepository.updateEmail(id, email);
      const verifyEmailToken = jwt.sign(
        {
          iss: "kubico-api",
          sub: id,
          iat: Math.floor(Date.now() / 1000),
          aud: existingUser.email,
        },
        ENV.JWT_SECRET,
        {
          expiresIn: "15m",
        },
      );

      /* await sendVerificationEmail(updatingEmail!.email, verifyEmailToken); */
    } catch (error) {
      throw new AppError(`Erro: ${error}`, 400);
    }
  },
};
