export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  APP_URL: process.env.APP_URL!,
  PORT: process.env.PORT || '4000',
  DATABASE_URL: process.env.DATABASE_URL!,
  EMAIL_HOST: process.env.EMAIL_HOST!,
  EMAIL_PORT: process.env.EMAIL_PORT!,
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
}
