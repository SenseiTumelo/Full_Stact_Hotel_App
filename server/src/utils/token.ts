import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { env } from '../config/env';

export const AUTH_COOKIE = 'access_token';
const SEVEN_DAYS = 7 * 24 * 60 * 60; // in seconds

export const cookieOptions: CookieOptions = {
  httpOnly: true,                 // JavaScript in the browser cannot read it
  secure: env.isProd,             // HTTPS only in production
  sameSite: 'lax',                // not sent on cross-site POST requests
  path: '/',
};

export function signToken(userId: string) {
  return jwt.sign({}, env.jwtSecret, { subject: userId, expiresIn: SEVEN_DAYS });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null; // expired, tampered with, or not a token at all
  }
}
export const cookieMaxAgeMs = SEVEN_DAYS * 1000;