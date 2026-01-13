import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/User';
import { UserRole, AuthProvider } from '../types/IUser';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
      callbackURL: `${BACKEND_URL}/api/v1/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          // If user exists but provider is different, maybe link accounts?
          // For now, just return the user if email matches
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails?.[0].value,
          password: '', // No password for OAuth users
          role: UserRole.USER,
          provider: AuthProvider.GOOGLE,
          providerId: profile.id,
        });

        return done(null, user);
      } catch (error: unknown) {
        return done(error instanceof Error ? error : new Error(String(error)), false);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'placeholder_client_secret',
      callbackURL: `${BACKEND_URL}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          return done(null, user);
        }

        user = await User.create({
          name: `${profile.name?.givenName} ${profile.name?.familyName}`,
          email: profile.emails?.[0].value,
          password: '',
          role: UserRole.USER,
          provider: AuthProvider.FACEBOOK,
          providerId: profile.id,
        });

        return done(null, user);
      } catch (error: unknown) {
        return done(error instanceof Error ? error : new Error(String(error)), false);
      }
    }
  )
);

export default passport;
