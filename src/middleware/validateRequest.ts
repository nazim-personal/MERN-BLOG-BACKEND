import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { AppError } from '../types/IError';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        ...req.body, // Also spread body to handle flat schemas
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((err: ZodIssue) => err.message).join(', ');
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
};
