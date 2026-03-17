import { AppError } from "../errors/App.Errors.js";
import { profileRole } from "../repositories/userProfile/profileRole.repositories.js";

export const assumeRolesServices = {
  client: async (id: number) => {
    const profileRoles = await profileRole.findAllRolesByProfileId(id);

    const verifyprofileRole = profileRoles.find((user) => user.role_id == 1);

    if (!verifyprofileRole) throw new AppError("Client nao cadastrado!", 403);

    await profileRole.updateAllProfileRolesStatus(id, false);

    await profileRole.updateProfileRoleStatus(id, 1, true);
  },
  owner: async (id: number) => {
    const profileRoles = await profileRole.findAllRolesByProfileId(id);

    const verifyProfileRole = profileRoles.find((user) => user.role_id == 2);

    if (!verifyProfileRole)
      throw new AppError("Proprietario nao cadastrado!", 403);

    await profileRole.updateAllProfileRolesStatus(id, false);

    await profileRole.updateProfileRoleStatus(id, 2, true);
  },
};
