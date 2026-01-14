import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { UserModel } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user as any);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await UserModel.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user as any);
            }

            // Check if user exists with same email
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await UserModel.findOne({ email });
                if (user) {
                    // Link account
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user as any);
                }
            }

            // Create new user
            const newUser = new UserModel({
                googleId: profile.id,
                email: email,
                name: profile.displayName,
                // Password is optional now, but we can set a random one or leave it undefined if schema allows
                // Since we made it optional in schema, we can skip it.
            });

            await newUser.save();
            done(null, newUser as any);
        } catch (error) {
            done(error, undefined);
        }
    }));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/v1/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'displayName']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await UserModel.findOne({ facebookId: profile.id });

            if (user) {
                return done(null, user as any);
            }

            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await UserModel.findOne({ email });
                if (user) {
                    user.facebookId = profile.id;
                    await user.save();
                    return done(null, user as any);
                }
            }

            const newUser = new UserModel({
                facebookId: profile.id,
                email: email, // Note: Facebook might not always return email
                name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
            });

            await newUser.save();
            done(null, newUser as any);
        } catch (error) {
            done(error, undefined);
        }
    }));
}
