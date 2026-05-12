import "dotenv/config";
import { ENV } from "../config/env.js";

export const emailConfig = {
  host: ENV.EMAIL_HOST,
  port: Number(ENV.EMAIL_PORT),
  secure: false,
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
};

export const EMAIL_FROM = `Kubiko <${ENV.EMAIL_USER}>`;
