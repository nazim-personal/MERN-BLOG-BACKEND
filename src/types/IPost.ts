import { Document, Types } from 'mongoose';

import { z } from 'zod';
import { createPostSchema, updatePostSchema, getPostsSchema } from '../validators/postValidator';

export interface IPost extends Document {
  title: string;
  content: string;
  slug: string;
  author: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostQuery {
  isDeleted?: boolean;
  author?: Types.ObjectId;
  slug?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type GetPostsQuery = z.infer<typeof getPostsSchema>['query'];

