import { z } from 'zod';
import { PostStatus } from '../models/post.model';

const MAX_CONTENT_LENGTH = 100000; // 100KB
const MAX_TITLE_LENGTH = 200;
const MAX_TAGS = 20;

export const createPostSchema = z.object({
    body: z.object({
        title: z.string()
            .min(3, 'Title must be at least 3 characters long')
            .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`)
            .transform(val => val.trim()),
        content: z.string()
            .min(10, 'Content must be at least 10 characters long')
            .max(MAX_CONTENT_LENGTH, `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`),
        status: z.nativeEnum(PostStatus).optional(),
        tags: z.array(z.string().trim().min(1).max(50))
            .max(MAX_TAGS, `Cannot have more than ${MAX_TAGS} tags`)
            .optional()
    })
});

export const updatePostSchema = z.object({
    params: z.object({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID')
    }),
    body: z.object({
        title: z.string()
            .min(3)
            .max(MAX_TITLE_LENGTH)
            .transform(val => val.trim())
            .optional(),
        content: z.string()
            .min(10)
            .max(MAX_CONTENT_LENGTH)
            .optional(),
        status: z.nativeEnum(PostStatus).optional(),
        tags: z.array(z.string().trim().min(1).max(50))
            .max(MAX_TAGS)
            .optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update"
    })
});

export const postQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(val => {
            const num = Number(val);
            return Math.min(num, 100); // Cap at 100
        }).optional(),
        status: z.nativeEnum(PostStatus).optional(),
        tags: z.string().optional(), // Comma separated tags
        includeDeleted: z.string().transform(val => val === 'true').optional()
    })
});
