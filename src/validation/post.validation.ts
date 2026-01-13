import { z } from 'zod';
import { PostStatus } from '../models/post.model';

export const createPostSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
        content: z.string().min(10, 'Content must be at least 10 characters long'),
        status: z.nativeEnum(PostStatus).optional(),
        tags: z.array(z.string()).optional()
    })
});

export const updatePostSchema = z.object({
    params: z.object({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID')
    }),
    body: z.object({
        title: z.string().min(3).max(100).optional(),
        content: z.string().min(10).optional(),
        status: z.nativeEnum(PostStatus).optional(),
        tags: z.array(z.string()).optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update"
    })
});

export const postQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        status: z.nativeEnum(PostStatus).optional(),
        tags: z.string().optional(), // Comma separated tags
        includeDeleted: z.string().transform(val => val === 'true').optional()
    })
});
