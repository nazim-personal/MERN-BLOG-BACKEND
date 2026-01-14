import { z } from 'zod';

const MAX_CONTENT_LENGTH = 5000;

export const createCommentSchema = z.object({
    body: z.object({
        content: z.string()
            .min(1, 'Content cannot be empty')
            .max(MAX_CONTENT_LENGTH, `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`)
            .transform(val => val.trim()),
        parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent comment ID').optional()
    }),
    params: z.object({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID')
    })
});

export const updateCommentSchema = z.object({
    body: z.object({
        content: z.string()
            .min(1)
            .max(MAX_CONTENT_LENGTH)
            .transform(val => val.trim())
    }),
    params: z.object({
        commentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID')
    })
});

export const commentQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(val => {
            const num = Number(val);
            return Math.min(num, 100); // Cap at 100
        }).optional()
    })
});
