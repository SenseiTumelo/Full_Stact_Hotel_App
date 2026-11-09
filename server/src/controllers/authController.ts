import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { env } from '../config/env';
import { createPasswordUser, findPasswordUserByEmail, findUserById } from '../repositories/userRepository';
import { AUTH_COOKIE, cookieMaxAgeMs, cookieOptions, signToken } from '../utils/token';
import { registerSchema, loginSchema } from '../schemas/authSchemas';
import { hashPassword, verifyPassword } from '../utils/password';
import { HttpError, sendError } from '../utils/httpError';

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

export async function registerWithPassword(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    res.status(400).json({ message: `${issue.path.join('.')}: ${issue.message}` });
    return;
  }
  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createPasswordUser({ ...parsed.data, passwordHash });
    res.cookie(AUTH_COOKIE, signToken(user.id), { ...cookieOptions, maxAge: cookieMaxAgeMs });
    res.status(201).json(user);
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      sendError(new HttpError(409, 'An account with this email already exists. Try signing in instead.'), res);
      return;
    }
    sendError(err, res);
  }
}

export async function loginWithPassword(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    res.status(400).json({ message: `${issue.path.join('.')}: ${issue.message}` });
    return;
  }
  try {
    const user = await findPasswordUserByEmail(parsed.data.email);
    const matches = await verifyPassword(parsed.data.password, user?.password_hash);
    if (!user || !matches) {
      res.status(401).json({ message: 'Email or password is incorrect.' });
      return;
    }
    res.cookie(AUTH_COOKIE, signToken(user.id), { ...cookieOptions, maxAge: cookieMaxAgeMs });
    res.json({ id: user.id, email: user.email, full_name: user.full_name, avatar_url: user.avatar_url, role: user.role });
  } catch (err) {
    sendError(err, res);
  }
}
