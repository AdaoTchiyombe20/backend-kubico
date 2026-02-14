import { AppError } from "../errors/App.Errors.js"
import { userRole } from "../repositories/userRole.repositories.js"

export const assumeRolesServices = {
    client: async(id: number)=> {
        const userRoles = await userRole.findAllRolesByUserId(id)
        
        const verifyUserRole = userRoles.find(
            (user) => user.role_id == 1
        )

        if(!verifyUserRole)
            throw new AppError('Client nao cadastrado!', 403)

        await userRole.updateAllUserRolesStatus(id, false)
        
        await userRole.updateUserRoleStatus(id,1, true)
    },
    owner: async(id: number)=> {
        const userRoles = await userRole.findAllRolesByUserId(id)
        
        const verifyUserRole = userRoles.find(
            (user) => user.role_id == 2
        )

        if(!verifyUserRole)
            throw new AppError('Proprietario nao cadastrado!', 403)

        await userRole.updateAllUserRolesStatus(id, false)
        
        await userRole.updateUserRoleStatus(id,2, true)
    }
}