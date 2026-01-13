import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format'),
    password: z.string(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});


