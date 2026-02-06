import z from 'zod'


export const updateEmail = z.object({
    email: z.string("Email precisa ser do tipo string!").email()
})

export const verifyclient = z.object({
    bi: z.string('BI precisa ser do tipo string').min(14,"Muito Bi Curto, deve conter 14 caracteres!").max(14,"Muito grande deve conter 14 caracteres!"),
    biUrl: z.string('a url do BI deve ser string'),
    userPhotoUrl: z.string('A url da Foto deve ser string') 
})

export const updateUser = z.object({
    name: z.string("name precisa ser do tipo string").min(3,"Deve conter no minio 3 caracteres o nome!"),
    phone: z.string("Phone precisa ser do tipo string").min(9,"Muito curto, um numero de telefone angolano deve conter 9 caracteres").max(9,"Muito grande, um numero de telefone angolano deve conter 9 caracteres"),
    password: z.string("Password precisa ser do tipo string").min(6,"Password muito curta, deve conter no minimo 6 caracteres!")
}).partial()


export const getUserId = z.object({
    id: z.coerce
        .number()
        .refine(Number.isInteger, {
        message: "ID deve ser um número inteiro",
        })
        .refine((n) => n > 0, {
        message: "ID deve ser positivo",
        }),
});

export type UserUpdateEmailDTO = z.infer<typeof updateEmail>
export type UserUpdateDTO = z.infer<typeof updateUser>
export type GetUserIdDTO = z.infer<typeof getUserId>;
export type VerifyClient = z.infer<typeof verifyclient>
