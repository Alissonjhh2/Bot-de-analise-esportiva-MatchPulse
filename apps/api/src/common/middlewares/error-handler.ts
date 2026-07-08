import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorCode } from '../types/api-response';
import { logger } from '@matchpulse/logger';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    return res.status(err.statusCode).json(response);
  }

  // Default error response
  const response: ApiResponse = {
    success: false,
    message: 'Internal server error',
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    },
  };

  return res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: 'Route not found',
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
  };
  return res.status(404).json(response);
};
