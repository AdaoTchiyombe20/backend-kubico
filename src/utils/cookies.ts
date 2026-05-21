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
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: false,  // ✅ Está false em dev?
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  console.log('🍪 Setando cookie:', { name, secure: finalOptions.secure, sameSite: finalOptions.sameSite });
  
  res.cookie(name, value, finalOptions);
}
