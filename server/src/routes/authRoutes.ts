import { Router } from 'express';
import passport from 'passport';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import {
  checkOAuthState,
  finishGoogleLogin,
  getMe,
  logout,
  startGoogleLogin,
} from '../controllers/authController';

const router = Router();

router.get('/google', startGoogleLogin);
router.get(
  '/google/callback',
  checkOAuthState,
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.clientUrl}/login?error=google`,
  }),
  finishGoogleLogin
);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);

export default router;