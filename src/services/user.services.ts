import { updateEmail, type UpdateUserPassworsDTO 
} from "../dto/user.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { profileRepository } from "../repositories/userProfile/profile.repositories.js";
import { hashPassword } from "../utils/hash.js";
import { sendVerificationEmail } from "./mail.services.js";


export const userService = {
  deleteUser: async (id: number) => {
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id não cadastrado!!", 404);

    const deleteProfile= await profileRepository.deleteProfile(id)

    if(!deleteProfile) throw new AppError('Erro ao Apapgar profile!', 400)
      
    return await userRepository.delete(id);
  },//pending...
  updateUserPassword: async (id: number, password: string) => {

    const existingUser = await userRepository.findById(id);

    if (!existingUser) throw new AppError("Id não cadastrado!!", 404);

    if (!password) throw new AppError("Password inválida!", 400);

    const hashed = await hashPassword(password);
    
    return await userRepository.updatePassword(id, hashed);
  },
  findUsers: async () => {
    return await userRepository.findAll();
  },
  findUserById: async (id: number) => {
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id inesistente!!!", 400);

    return existingId;
  },
  updateEmail: async(id:number,email:string) => {
    const existingUser = await userRepository.findById(id)

    if(!existingUser) throw new AppError('Usuario nao encontrado!', 400)
    if(email === existingUser.email) throw new AppError('Novo e-mail deve ser diferente do antigo!', 400)
    
    const updatingEmail = await userRepository.updateEmail(id, email)

    /* if(!updatingEmail?.email_verified) sendVerificationEmail(updatingEmail?.email, accessToken) */
    
  } // terminar o updating Email !!!
};
