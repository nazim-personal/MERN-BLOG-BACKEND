import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map((err: any) => {
                    const path = err.path.join('.');
                    let received = 'undefined';

                    // Try to find the received value from req
                    if (err.path[0] === 'body') received = JSON.stringify(req.body[err.path[1]]);
                    if (err.path[0] === 'query') received = JSON.stringify(req.query[err.path[1]]);
                    if (err.path[0] === 'params') received = JSON.stringify(req.params[err.path[1]]);

                    return {
                        field: path,
                        message: err.message,
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
            return res.status(500).json({
                message: 'Internal server error during validation',
                success: false
            });
        }
    };
