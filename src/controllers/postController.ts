import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/postService';

import { GetPostsQuery } from '../types/IPost';
import { UserRole } from '../types/IUser';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return; // Should be handled by auth middleware

    const post = await postService.createPost(req.body, req.user._id.toString());

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query as unknown as GetPostsQuery;

    const result = await postService.getPosts(
      {},
      {
        page: parseInt(page || '1'),
        limit: parseInt(limit || '10'),
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
      }
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await postService.getPostBySlug(req.params.slug as string);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;

    const post = await postService.updatePost(
      req.params.id as string,
      req.body,
      req.user._id.toString(),
      req.user.role === UserRole.ADMIN
    );

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;

    await postService.deletePost(
      req.params.id as string,
      req.user._id.toString(),
      req.user.role === UserRole.ADMIN
    );

    res.status(200).json({
      success: true,
      data: {},
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
