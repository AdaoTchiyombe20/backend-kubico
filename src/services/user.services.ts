import { type UserUpdateDTO, type VerifyClientDTO, type VerifyOwnerDTO } from "../dto/user.dto.js";
import { AppError } from "../errors/App.Errors.js";
import { refreshTokenUser } from "../repositories/refreshToken.repositories.js";
import {userRole} from '../repositories/userRole.repositories.js'
import { clientsRepository } from "../repositories/client.repositories.js";
import { userMidiaRepository } from "../repositories/userMidia.repositories.js";
import { userRepository } from "../repositories/user.repositories.js";
import { hashPassword } from "../utils/hash.js";
import { verifyOwnerRepository } from "../repositories/owner.repositories.js";

export const userService = {
  deleteUser: async (data: { id: number }) => {
    const id = data.id;
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id não cadastrado!!", 404);

    return await userRepository.delete(id);
  },
  updateUser: async (id: number, data: UserUpdateDTO) => {
    const existingUser = await userRepository.findById(id);
    const users = await userRepository.findAll();

    if (!existingUser) throw new AppError("Id não cadastrado!!", 404);

    const cleanData: Partial<{
      name: string;
      phone: string;
      password: string;
    }> = {};

    if (data.name !== undefined) {
      if (users && users.length > 0) {
        const verifyName = users.find(
          (user) => user.name === data.name && user.id !== id,
        );

        if (verifyName)
          throw new AppError("Este nome ja esta a ser usado!", 409);

        cleanData.name = data.name.trim();
      }
    }
    if (data.phone !== undefined) {
      if (users && users.length > 0) {
        const verifyPhone = users.find(
          (user) => user.phone === data.phone && user.id !== id,
        );

        if (verifyPhone)
          throw new AppError("Este telefone ja esta cadastrado!", 409);

        cleanData.phone = data.phone.trim().replace(/\s+/g, "");
      }
    }
    if (data.password !== undefined) {
      cleanData.password = await hashPassword(data.password);
    }
    if (Object.keys(cleanData).length === 0) {
      console.log(Object.keys(cleanData));
      throw new AppError("Nenhuma informação recebida!", 406);
    }

    return await userRepository.update(id, cleanData);
  },
  updateEmail: async (id: number, data: { email: string }) => {
    const users = await userRepository.findAll();
    const { email } = data;

    if (users && users.length > 0) {
      const verifingEmail = users.find(
        (user) => user.email === email && user.id !== id,
      );

      if (verifingEmail) {
        throw new AppError("O este email ja esta a ser usado!");
      }
      return await userRepository.updateEmail(id, { email });
    }
  },
  findUsers: async () => {
    return await userRepository.findAll();
  },
  findUserById: async (id: number) => {
    const existingId = await userRepository.findById(id);

    if (!existingId) throw new AppError("Id inesistente!!!", 404);

    return existingId;
  },
  verifyClient: async(id: number, data: VerifyClientDTO) => {
    const user = await userRepository.findById(id)

    if(!user)
      throw new AppError("Usuairo não encontrado!", 403)

    const userRoleData = await userRole.findAllRolesByUserId(user.id)

    const verifyUserRole= userRoleData.find( 
      (user) => user.role_id == 1  
      )
    if(verifyUserRole)
      throw new AppError('Cliente ja cadastrado!',400)

    const userRoles = await userRole.insertValues(user.id,1, 'PENDING')

    const client = await clientsRepository.createClient(userRoles.id)

    const getAllMidiaUserId = await userMidiaRepository.findAllUserMidiaById(user.id)

    
    await userMidiaRepository.insertMidia(user.id, 'BI', data.bi, data.biUrl)

    await userMidiaRepository.insertMidia(user.id, 'SELFIE_WITH_BI', null, data.userPhotoUrl)

    return client


  },
  verifyOwner: async(id: number, data: VerifyOwnerDTO) => {
    const user = await userRepository.findById(id)

    if(!user)
      throw new AppError("Usuairo não encontrado!", 403)

    const userRoleData = await userRole.findAllRolesByUserId(user.id)

    const verifyUserRole= userRoleData.find( 
      (user) => user.role_id == 2  
      )
    if(verifyUserRole)
      throw new AppError('Proprietario ja cadastrado!',400)


    const userRoles = await userRole.insertValues(user.id,2, 'PENDING')

    const owner = await verifyOwnerRepository.createOwner(userRoles.id, data.ownerType, data.ownerType == 'PJ'? data.companyName?? user.name: '', data.bankAcount)


    return owner


  },
};
