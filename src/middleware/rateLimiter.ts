import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      code: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
