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
        const validationErrors = err.errors.map((e: any) => {
            const path = e.path.join('.');
            let received = 'undefined';

            // Try to find the received value from req
            if (e.path[0] === 'body') received = JSON.stringify(req.body[e.path[1]]);
            if (e.path[0] === 'query') received = JSON.stringify(req.query[e.path[1]]);
            if (e.path[0] === 'params') received = JSON.stringify(req.params[e.path[1]]);

            return {
                field: path,
                message: e.message,
                received
            };
        });

        const detailedMessage = `Validation failed: ${validationErrors.map(e => `${e.field}: ${e.message} (received: ${e.received})`).join(', ')}`;

        return res.status(400).json({
            message: detailedMessage,
            errors: validationErrors,
            success: false
        });
    }

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val: any) => {
            return `${val.message} (received: ${val.value})`;
        }).join(', ');

        return res.status(400).json({
            message,
            success: false
        });
    }

    // Handle Mongoose Duplicate Key Errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value entered: ${field} (received: ${value})`;

        return res.status(400).json({
            message,
            success: false
        });
    }

    // Handle Mongoose Cast Errors
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value} (received: ${err.value})`;
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
