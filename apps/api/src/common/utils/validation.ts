import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middlewares/error-handler';
import { ErrorCode } from '../types/api-response';

/**
 * Validate request body against schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          400,
          errors
        );
      }
      throw error;
    }
  };
}

/**
 * Validate request params against schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      (req.params as T) = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          400,
          errors
        );
      }
      throw error;
    }
  };
}

/**
 * Validate request query against schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      (req.query as T) = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          400,
          errors
        );
      }
      throw error;
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    pageSize: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
  }),
  
  id: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
  
  email: z.string().email('Invalid email format'),
  
  positiveNumber: z.number().min(0, 'Must be a positive number'),
  
  nonEmptyString: z.string().min(1, 'Cannot be empty'),
};
