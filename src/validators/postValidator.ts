import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    content: z
      .string()
      .min(10, 'Content must be at least 10 characters'),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    content: z
      .string()
      .min(10, 'Content must be at least 10 characters')
      .optional(),
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});


