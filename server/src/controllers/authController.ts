import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { env } from '../config/env';
import { findUserById } from '../repositories/userRepository';
import { AUTH_COOKIE, cookieMaxAgeMs, cookieOptions, signToken } from '../utils/token';

const STATE_COOKIE = 'oauth_state';

// Step 1: send the user to Google
export function startGoogleLogin(req: Request, res: Response, next: NextFunction) {
  // A random value we also keep in a cookie. It proves the user who comes back is the one who left.
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, { ...cookieOptions, maxAge: 10 * 60 * 1000 });

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
}

// Step 2a: check the "state" before trusting the callback
export function checkOAuthState(req: Request, res: Response, next: NextFunction) {
  const expected = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, cookieOptions);

  if (!expected || req.query.state !== expected) {
    res.redirect(`${env.clientUrl}/login?error=state`);
    return;
  }
  next();
}

// Step 2b: Google approved. Give the user our login cookie.
export function finishGoogleLogin(req: Request, res: Response) {
  const user = req.user!; // set by Passport
  res.cookie(AUTH_COOKIE, signToken(user.id), { ...cookieOptions, maxAge: cookieMaxAgeMs });
  res.redirect(env.clientUrl);
}

export async function getMe(req: Request, res: Response) {
  const user = await findUserById(req.user!.id);
  res.json(user);
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.status(204).send();
}