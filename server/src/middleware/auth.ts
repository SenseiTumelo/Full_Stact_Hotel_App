import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE, verifyToken } from '../utils/token';
import { findUserById } from '../repositories/userRepository';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];
  const userId = token ? verifyToken(token) : null;

  if (!userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(role: 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ message: 'You do not have permission to do this' });
      return;
    }
    next();
  };
}