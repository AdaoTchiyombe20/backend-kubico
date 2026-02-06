import "dotenv/config";
import { env } from "prisma/config";


export const emailConfig = {
  host: env('EMAIL_HOST'),
  port: Number(env('EMAIL_PORT')),
  secure: false,
  auth: {
    user: env('EMAIL_USER'),
    pass: env('EMAIL_PASS')
  }
}

