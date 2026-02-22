import {
  UserRoleStatus,
  type profile_roles,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

export const profileRole = {
  findAll: async (): Promise<profile_roles[]> => {
    return (await prisma.profile_roles.findMany()) || [];
  },
  findAllRolesByProfileId: async (id: number): Promise<profile_roles[]> => {
    return await prisma.profile_roles.findMany({
      where: { profile_id: id },
    });
  },
  findProfileRoleByRole: async(profile_id: number, role_id: number): Promise<profile_roles | null> => {
    return prisma.profile_roles.findUnique({
      where: {
        profile_id_role_id: {
        profile_id,
        role_id
      }}
    })
  },
  updateAllProfileRolesStatus: async (
    profile_id: number,
    is_active: boolean,
  ): Promise<void> => {
    await prisma.profile_roles.updateMany({
      where: { profile_id },
      data: { is_active },
    });
  },
  insertValues: async (
    profile_id: number,
    role_id: number,
    status: UserRoleStatus,
  ): Promise<profile_roles> => {
    return prisma.profile_roles.create({
      data: {
        profile_id,
        role_id,
        status,
        is_active: true,
        created_at: new Date(),
      },
    });
  },
  updateProfileRoleStatus: async (
    profile_id: number,
    role_id: number,
    is_active: boolean,
  ): Promise<void> => {
    await prisma.profile_roles.update({
      where: {
        profile_id_role_id: {
          profile_id,
          role_id,
        },
      },
      data: { is_active },
    });
  },
};
