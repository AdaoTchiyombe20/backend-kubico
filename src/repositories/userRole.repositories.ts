import { UserRoleStatus, type user_roles } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export const userRole = {
  findAll: async (): Promise<user_roles[]> => {
    return (await prisma.user_roles.findMany()) || [];
  },
  findAllRolesByUserId: async (id: number): Promise<user_roles[]> => {

    return await prisma.user_roles.findMany({
      where: { user_id: id },
    });
  },
  updateAllUserRolesStatus: async(user_id: number, is_active:boolean): Promise<void> => {

      await prisma.user_roles.updateMany({
        where: {user_id},
        data: {is_active}
      })
  },
  insertValues: async(user_id:number, role_id: number, status: UserRoleStatus): Promise<user_roles> => {
  
    return prisma.user_roles.create({
      data : {
        user_id,
        role_id,
        status,
        created_at: new Date()
      }})

  },
  updateUserRoleStatus: async(userId:number, roleId: number, is_active: boolean): Promise<void> => {
    await prisma.user_roles.update({
      where: {
        user_id_role_id: {
          user_id: userId, 
          role_id: roleId
        }},
      data: {is_active}
    })
  } 
}
 
