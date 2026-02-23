import rateLimit from "express-rate-limit";
import { error } from "node:console";

export const globalRateLimiting  = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,       
  message: {
    status: 429,
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const loginRateLimiting = rateLimit({
    windowMs: 10*60*1000,
    max: 5,
    message: {
        error: "Muitas tentativas para login"
    }
})

export const publicRateLimiting = rateLimit({
    windowMs: 60*1000,
    max:30,
    message: {
        error:"Muitas requisições na rota publica"
    }
})
