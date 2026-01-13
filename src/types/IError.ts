export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: number;
    stack?: string;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}
