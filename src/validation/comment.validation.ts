import { z } from 'zod';

export const createCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Content cannot be empty').max(1000, 'Content cannot exceed 1000 characters')
    }),
    params: z.object({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID')
    })
});

export const updateCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1).max(1000)
    }),
    params: z.object({
        commentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID')
    })
});
