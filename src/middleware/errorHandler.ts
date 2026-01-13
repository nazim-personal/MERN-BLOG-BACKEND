import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/IError';

interface ExtendedError extends Error {
  statusCode?: number;
  code?: number;
  value?: string;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: ExtendedError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error: AppError;

  // Log error for debugging
  console.error(`[ERROR] ${_req.method} ${_req.path}:`, err);

  // Default error object
  if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(err.message || 'Server Error', err.statusCode || 500);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401);
  }

  const statusCode = error.statusCode || 500;
  const response: ErrorResponse = {
    success: false,
    error: {
      message: error.message || 'Server Error',
      code: statusCode,
    },
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
