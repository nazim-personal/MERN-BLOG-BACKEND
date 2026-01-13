import { Request, Response, NextFunction } from 'express';
import { AppError } from './custom-errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error
    logger.error(`Error: ${err.message} - Stack: ${err.stack}`);

    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: (err as any).errors.map((e: any) => ({
                field: e.path.join('.'),
                message: e.message
            })),
            success: false
        });
    }

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
        return res.status(400).json({
            message,
            success: false
        });
    }

    // Handle Mongoose Duplicate Key Errors
    if (err.code === 11000) {
        const message = `Duplicate field value entered`;
        return res.status(400).json({
            message,
            success: false
        });
    }

    // Handle Mongoose Cast Errors
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json({
            message,
            success: false
        });
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token. Please log in again!',
            success: false
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Your token has expired! Please log in again.',
            success: false
        });
    }

    // Handle Custom App Errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            success: false
        });
    }

    // Default Error Response
    return res.status(500).json({
        message: 'Internal Server Error',
        success: false
    });
};
