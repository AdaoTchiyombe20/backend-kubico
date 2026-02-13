import {prisma} from '../../lib/prisma.js'
import type { owners, TypeOfOwner } from '../../generated/prisma/index.js'

export const verifyOwnerRepository = {
    createOwner: async(user_role_id:number, owner_type: TypeOfOwner, companyName: string, bank_acount: string): Promise<owners> => {
        return prisma.owners.create({
            data: {
                user_role_id,
                owner_type,
                company_name: companyName || null,
                bank_acount
            }
        })
    }
} 