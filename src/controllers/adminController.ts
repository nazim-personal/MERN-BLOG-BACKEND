import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { UserRole } from '../types/IUser';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid role',
          code: 400
        }
      });
      return;
    }

    const user = await adminService.updateUserRole(req.params.id as string, role);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteUser(req.params.id as string);

    res.status(200).json({
      success: true,
      data: {},
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await adminService.getAllPosts();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const hardDeletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.hardDeletePost(req.params.id as string);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Post permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};
