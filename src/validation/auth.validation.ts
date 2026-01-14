import { z } from 'zod';

// Password must be at least 8 characters with uppercase, lowercase, number, and special character
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address').transform(val => val.trim().toLowerCase()),
        password: passwordSchema,
        name: z.string()
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name cannot exceed 100 characters')
            .transform(val => val.trim().replace(/\s+/g, ' '))
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address').transform(val => val.trim().toLowerCase()),
        password: z.string().min(1, 'Password is required')
    })
});
