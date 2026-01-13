import { z } from 'zod';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator';

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
