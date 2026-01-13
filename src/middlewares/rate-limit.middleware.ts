import rateLimit from 'express-rate-limit';

// General authentication rate limiter - 20 requests per 15 minutes
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        message: 'Too many requests from this IP, please try again later',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Login rate limiter - 5 attempts per 15 minutes
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: 'Too many login attempts from this IP, please try again after 15 minutes',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Register rate limiter - 3 attempts per hour
export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        message: 'Too many registration attempts from this IP, please try again after an hour',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Refresh token rate limiter - 10 requests per 15 minutes
export const refreshTokenRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        message: 'Too many token refresh requests, please try again later',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});
