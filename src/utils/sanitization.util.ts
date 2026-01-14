import { Types } from 'mongoose';

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
};

/**
 * Validates and converts string to ObjectId
 * @throws Error if invalid ObjectId
 */
export const toObjectId = (id: string): Types.ObjectId => {
    if (!isValidObjectId(id)) {
        throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
};

/**
 * Sanitizes email by trimming and converting to lowercase
 */
export const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

/**
 * Sanitizes name by trimming and removing extra whitespace
 */
export const sanitizeName = (name: string): string => {
    return name.trim().replace(/\s+/g, ' ');
};

/**
 * Removes sensitive fields from user object
 */
export const sanitizeUserResponse = (user: any): any => {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

/**
 * Validates and sanitizes pagination parameters
 */
export const sanitizePaginationParams = (page?: number, limit?: number): { page: number; limit: number } => {
    const MAX_LIMIT = 100;
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;

    const sanitizedPage = page && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
    const sanitizedLimit = limit && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : DEFAULT_LIMIT;

    return { page: sanitizedPage, limit: sanitizedLimit };
};

/**
 * Removes sensitive data from log messages
 */
export const sanitizeLogData = (data: any): any => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
};
