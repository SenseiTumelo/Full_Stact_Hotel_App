import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { findOrCreateGoogleUser } from '../repositories/userRepository';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const emailVerified = Boolean((profile._json as { email_verified?: boolean }).email_verified);

        // Only trust verified emails. Otherwise someone could claim another person's address.
        if (!email || !emailVerified) {
          return done(new Error('Your Google email address is not verified'));
        }

        const user = await findOrCreateGoogleUser({
          googleId: profile.id,
          email: email.toLowerCase(),
          fullName: profile.displayName || email,
          avatarUrl: profile.photos?.[0]?.value ?? null,
        });

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);
