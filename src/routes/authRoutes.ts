import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validateRequest';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator';
import { authLimiter } from '../middleware/rateLimiter';
import { logActivity } from '../middleware/activityLogger';
import { protect } from '../middleware/authMiddleware';
import passport from 'passport';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', authLimiter, logActivity('LOGIN'), validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.oauthCallback
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  authController.oauthCallback
);

export default router;
