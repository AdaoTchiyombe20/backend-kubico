import z, {string} from 'zod'

export const signup = z.object({
        email : z.string("Apenas String!!").email('Email Invalido!'),
        password : z.string("Apenas String!!").min(6),
})

export const login = z.object({
    email: string().email("Email Invalido"),
    password: string()
})



export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
  userId: z.coerce.number().refine(Number.isInteger, {
    message: 'Id deve ser um numero',
  }).refine(n => n > 0 , {
    message: 'Id deve ser positivo'
  }), 
  expiresAt: z.date()
})

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

export type AuthSignUpDTO = z.infer<typeof signup>
export type AuthLoginDTO = z.infer<typeof login>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>
export type GetUserIdDTO = z.infer<typeof getUserId>
