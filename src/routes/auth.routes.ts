import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { Role, Permission } from '../config/roles';
import { loginRateLimiter, registerRateLimiter, refreshTokenRateLimiter } from '../middlewares/rate-limit.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { permissionMiddleware } from '../middlewares/permission.middleware'; // Re-adding this as it's used in the routes

export const createAuthRoutes = (
    authController: AuthController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository,
    activityLogger: (action: string, resource: string) => any
): Router => {
    const router = Router();

    // Public routes
    router.post('/register',
        registerRateLimiter,
        validate(registerSchema),
        activityLogger('register', 'user'),
        authController.register
    );

    router.post('/login',
        loginRateLimiter,
        validate(loginSchema),
        activityLogger('login', 'user'),
        authController.login
    );

    router.post('/refresh-token',
        refreshTokenRateLimiter,
        authController.refreshToken
    );

    // Protected routes
    router.post('/logout',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        activityLogger('logout', 'user'),
        authController.logout
    );


    // User management routes
    router.get('/users',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.USERS_VIEW),
        authController.listUsers
    );

    router.put('/users/:userId/role',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.USERS_MANAGE),
        authController.updateUserRole
    );

    router.put('/users/:userId/permissions',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        permissionMiddleware(Permission.PERMISSIONS_MANAGE),
        authController.updateUserPermissions
    );

    return router;
};
