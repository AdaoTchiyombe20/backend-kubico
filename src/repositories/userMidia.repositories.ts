import type { DocType, userMidias } from '../../generated/prisma/index.js'
import {prisma} from '../../lib/prisma.js'

export const userMidiaRepository = {
    insertMidia: async(user_id: number, type_midia: DocType, document_number: string | null , url: string): Promise<void>=> {
        await prisma.userMidias.create({
            data: {
                user_id,
                type_midia,
                document_number: document_number?document_number: null,
                url,
                uploaded_at: new Date()
            }
        })
    },
    findAllUserMidiaById: async(id: number): Promise<userMidias[]> =>{
        return await prisma.userMidias.findMany({
            where: {id}
        }) || []
    }
}