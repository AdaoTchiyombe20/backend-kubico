import "dotenv/config";
import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";
import { emailConfig, EMAIL_FROM } from "../config/email.js";

const transporter = nodemailer.createTransport(emailConfig);

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${ENV.APP_URL}/api/auth/verify-email?token=${token}`;

  return transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: "Confirma o teu email",
    html: `
      <p>Clica no link para confirmar o teu email:</p>
      <a href="${link}">${link}</a>
    `,
  });
}
