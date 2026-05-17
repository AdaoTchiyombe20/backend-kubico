import z from 'zod'

export const createAdmin = z.object({
    adminsName: z.string('Only string').min(3,'Min 3 characteres'),
    email: z.string('Only String').email('Email invalido!'),
    accessLevel: z.enum(['SUPER_ADMIN','NORMAL']),
    password: z.string('Only string').min(3,'Min 3 characteres')
})

export const loginAdmin = z.object({
    email: z.string('Only String').email('Email invalido!'),
    password: z.string('Only String').min(6,'Min 6 characters')
})

export type createAdminDTO = z.infer <typeof createAdmin>
export type AdminLoginDTO = z.infer<typeof loginAdmin>
