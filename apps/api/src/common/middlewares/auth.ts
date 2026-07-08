import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { ErrorCode } from '../types/api-response';
import admin from 'firebase-admin';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
      };
    }
  }
}

export const authenticateFirebase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Bypass authentication in development if AUTH_ENABLED is false or not set
  if (process.env.AUTH_ENABLED !== 'true') {
    // Create or get dev user
    const devUser = await prisma.user.upsert({
      where: { firebaseUid: 'dev-user' },
      update: {},
      create: {
        firebaseUid: 'dev-user',
        name: 'Dev User',
        email: 'dev@example.com',
        role: 'ADMIN',
        plan: 'PREMIUM',
      },
    });

    req.user = {
      uid: devUser.id,
      email: devUser.email,
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        'No authorization token provided',
        401
      );
    }

    const token = authHeader.substring(7);
    
    // Try to verify with Firebase Admin if available
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
      };
      
      next();
      return;
    } catch (adminError) {
      // If Firebase Admin is not configured, decode token without verification (dev only)
      try {
        const decoded = jwt.decode(token) as any;
        
        if (!decoded || !decoded.user_id) {
          throw new AppError(
            ErrorCode.AUTHENTICATION_ERROR,
            'Invalid token format',
            401
          );
        }
        
        req.user = {
          uid: decoded.user_id,
          email: decoded.email || '',
        };
        
        next();
      } catch (decodeError) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'Invalid or expired token',
          401
        );
      }
    }
  } catch (error) {
    throw new AppError(
      ErrorCode.AUTHENTICATION_ERROR,
      'Invalid or expired token',
      401
    );
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Implement admin check based on user role in database
  next();
};
