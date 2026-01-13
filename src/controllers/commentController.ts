import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService';
import { UserRole } from '../types/IUser';

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;

    const comment = await commentService.createComment(
      req.params.postId as string,
      req.body,
      req.user._id.toString()
    );

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await commentService.getCommentsByPost(req.params.postId as string);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;

    const comment = await commentService.updateComment(
      req.params.id as string,
      req.body,
      req.user._id.toString(),
      req.user.role === UserRole.ADMIN
    );

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;

    await commentService.deleteComment(
      req.params.id as string,
      req.user._id.toString(),
      req.user.role === UserRole.ADMIN
    );

    res.status(200).json({
      success: true,
      data: {},
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
