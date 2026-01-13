import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { Role } from '../config/roles';

export const createAdminRoutes = (
    adminController: AdminController,
    accessSecret: string,
    sessionRepository: SessionRepository,
    userRepository: UserRepository
): Router => {
    const router = Router();

    // Dashboard statistics - Admin only
    router.get('/dashboard',
        authMiddleware(accessSecret, sessionRepository, userRepository),
        roleMiddleware([Role.ADMIN]),
        adminController.getDashboardStats
    );

    return router;
};
