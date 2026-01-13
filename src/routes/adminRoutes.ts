import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/IUser';

const router = Router();

// Protect all admin routes
router.use(protect, authorize(UserRole.ADMIN));

router.get('/dashboard', adminController.getDashboardStats);

router.route('/users')
  .get(adminController.getAllUsers);

router.route('/users/:id')
  .delete(adminController.deleteUser);

router.route('/users/:id/role')
  .put(adminController.updateUserRole);

router.route('/posts')
  .get(adminController.getAllPosts);

router.route('/posts/:id')
  .delete(adminController.hardDeletePost);

export default router;
