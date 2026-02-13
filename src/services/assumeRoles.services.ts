import { userRole } from "../repositories/userRole.repositories.js"

export const assumeRolesServices = {
    client: async(id: number)=> {
        await userRole.updateAllUserRolesStatus(id, false)
        
        await userRole.updateUserRoleStatus(id,1, true)
    },
    owner: async(id: number)=> {
        await userRole.updateAllUserRolesStatus(id, false)
        
        await userRole.updateUserRoleStatus(id,1, true)
    }
}