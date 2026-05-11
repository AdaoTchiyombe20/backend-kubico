import rateLimit from "express-rate-limit";

const sharedConfig = {
  validate: { xForwardedForHeader: false }
}

export const globalRateLimiting = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...sharedConfig
})

export const loginRateLimiting = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas para login"
  },
  ...sharedConfig
})

export const publicRateLimiting = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: "Muitas requisições na rota publica"
  },
  ...sharedConfig
})