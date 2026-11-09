import { Router } from 'express';
import passport from 'passport';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import {
  checkOAuthState,
  finishGoogleLogin,
  getMe,
  loginWithPassword,
  logout,
  registerWithPassword,
  startGoogleLogin,
  updateMyProfile,
} from '../controllers/authController';

const router = Router();
const credentialsLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please wait a little and try again.' },
});

router.post('/register', credentialsLimit, registerWithPassword);
router.post('/login', credentialsLimit, loginWithPassword);
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
router.patch('/me', requireAuth, updateMyProfile);
router.post('/logout', logout);

export default router;
