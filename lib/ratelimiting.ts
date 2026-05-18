import rateLimit from "express-rate-limit";

const sharedConfig = {
  validate: { xForwardedForHeader: false }
}

export const globalRateLimiting = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Muitas requisições. Tente novamente daqui a 15min.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...sharedConfig
})

export const loginRateLimiting = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    message: "Muitas tentativas para login ou cadastro. Tente novamente daqui a 10min."
  },
  ...sharedConfig
})

export const publicRateLimiting = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: "Muitas requisições na rota publica em pouco tempo. Tente novamente daqui a 1min."
  },
  ...sharedConfig
})