import { type Response } from 'express';

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
}

export function setCookie(
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const isProduction = process.env.NODE_ENV === "production";

res.cookie(name, value, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction
    ? "none"
    : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

}