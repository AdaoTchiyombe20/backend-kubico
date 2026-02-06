import { type user_roles } from "../../generated/prisma/client.js";
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
  updateAllUserRolesStatus: async(id: number, is_active:boolean): Promise<void> => {

      await prisma.user_roles.updateMany({
        where: {id},
        data: {is_active}
      })
  },
  insertValues: async(data: {userId:number, roleid: number }): Promise<user_roles> => {
  
    return prisma.user_roles.create({
      data : {
        user_id: data.userId,
        role_id: data.roleid,
        status: 'PENDING',
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
 
