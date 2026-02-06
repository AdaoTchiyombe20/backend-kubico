import "dotenv/config";
import { env } from "prisma/config";
import type { AuthLoginDTO, AuthSignUpDTO } from "../dto/auth.dto.js";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/App.Errors.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { authRepositories } from "../repositories/auth.repositories.js";
import { refreshTokenUser } from "../repositories/refreshToken.repositories.js";
import { userRole } from "../repositories/userRole.repositories.js";
import { userRepository } from "../repositories/user.repositories.js";
import { sendVerificationEmail } from "./mail.services.js";

export const authServices = {
  signUp: async (data: AuthSignUpDTO) => {
    const { name, email, phone, password } = data;
    const existingEmail = await authRepositories.findByEmail(email);
    const existingPhone = await authRepositories.findByPhone(phone);

    const userName = name.trim();
    const userEmail = email.trim();
    const userPhone = phone.trim();
    const passwordHash = await hashPassword(password);

    if (existingEmail) throw new AppError("Email já cadastrado!!", 409);

    if (existingPhone) throw new AppError("Número já cadastrado!!", 409);

    const user = await authRepositories.signUp({
      name: userName,
      email: userEmail,
      phone: userPhone,
      password: passwordHash, 
    });

    const user_role = await userRole.insertValues({
      userId: user.id,
      roleid: 4 // Normal
    })
    const refreshToken = jwt.sign(
      {
        sub: user.id,
      },
      env("JWT_REFRESH_SECRET"),
      { expiresIn: "7d" },
    );

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: "NORMAL",
        iat: Math.floor(Date.now() / 1000)
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

    if(!user.email_verified)
      await sendVerificationEmail(user.email, accessToken)

    return {
      user,
      refreshToken,
      accessToken,
      message: "usuario criado com sucesso!",
    };
  },
  login: async (data: AuthLoginDTO) => {
    const { email, password } = data;
    const user = await authRepositories.findByEmail(email);

    if (!user) 
      throw new AppError("Usuario nao encontrado!!", 404);

    const verfiryUserPassword = await comparePassword(password, user.password);

    if (!verfiryUserPassword) 
      throw new AppError("senha incorreta!!", 401);

    if(user.email_verified) 
      throw new AppError('Valide o seu email', 400)

    const refreshToken = jwt.sign(
      {
        sub: user.id,
      },
      env("JWT_REFRESH_SECRET"),
      { expiresIn: "7d" },
    );

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: "NORMAL",
        iat: Math.floor(Date.now() / 1000),
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

    await userRepository.updateStatus(user.id,true)
    await userRole.updateUserRoleStatus(user.id,4,true)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      refreshToken,
      accessToken,
    };
  },
  logout: async (refreshToken: string) => {

    if (!refreshToken) throw new AppError("Refresh token nao fornecido!", 400);

    const token = await refreshTokenUser.revokeRefreshToken(refreshToken);
    const id = token!.user_id

    await userRepository.updateStatus(id, false)
    await userRole.updateAllUserRolesStatus(id,false)
    return { message: "Logout Realizado com Sucesso!" };
  },
  verifyEmail: async (token: string) => {
  const user = await refreshTokenUser.findRefreshToken(token);
  
  if (!user) {
    throw new AppError("Token inválido ou expirado", 401);
  }
  const getUser = await userRepository.findById(user!.user_id)

  if(!getUser)
    throw new AppError('Usuario usuario nao encontrado', 404)

  getUser.email_verified = true;

  await userRepository.update(getUser.id,{email_verified: true});
  },
  refresh: async() => {
    
  },
};
