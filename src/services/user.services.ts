import type { UpdateUserPassworsDTO 
} from "../dto/user.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { hashPassword } from "../utils/hash.js";


export const userService = {
  deleteUser: async (data: { id: number }) => {
    const id = data.id;
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id não cadastrado!!", 404);

    return await userRepository.delete(id);
  },//pending...
  updateUserPassword: async (id: number, data: UpdateUserPassworsDTO) => {

    const existingUser = await userRepository.findById(id);

    if (!existingUser) throw new AppError("Id não cadastrado!!", 404);

    if (!data.password) throw new AppError("Password inválida!", 400);

    const hashed = await hashPassword(data.password);
    
    return await userRepository.updatePassword(id, hashed);
  },
  findUsers: async () => {
    return await userRepository.findAll();
  },
  findUserById: async (id: number) => {
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id inesistente!!!", 404);

    return existingId;
  },
};
