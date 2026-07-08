import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { ErrorCode } from '../types/api-response';
import admin from 'firebase-admin';
import { prisma } from '../config/prisma';
import { env } from '../config/env-validation';

declare module 'express' {
  interface Request {
    user?: {
      uid: string;
      email: string;
      firebaseUid: string;
      role: string;
      plan: string;
    };
    ip?: string;
  }
}

// Firebase token cache with TTL
const tokenCache = new Map<string, { decoded: unknown; expiresAt: number }>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const authenticateFirebase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication if disabled in development
  if (!env.AUTH_ENABLED && env.NODE_ENV !== 'production') {
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
      firebaseUid: devUser.firebaseUid,
      role: devUser.role,
      plan: devUser.plan,
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
    
    // Check cache first
    const cached = tokenCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      const decoded = cached.decoded as { uid: string };
      const user = await getUserFromFirebaseUid(decoded.uid);
      if (user) {
        req.user = {
          uid: user.id,
          email: user.email,
          firebaseUid: user.firebaseUid,
          role: user.role,
          plan: user.plan,
        };
        return next();
      }
    }

    // Verify with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    
    // Validate issuer
    if (decodedToken.iss !== `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Invalid token issuer',
        401
      );
    }

    // Validate audience
    if (decodedToken.aud !== process.env.FIREBASE_PROJECT_ID) {
      throw new AppError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Invalid token audience',
        401
      );
    }

    // Check if token is revoked (if revocation check is enabled)
    try {
      await admin.auth().verifySessionCookie(token, true);
    } catch (revocationError) {
      // Session cookie verification failed, but ID token is still valid
      // This is expected for ID tokens
    }

    // Get user from database
    const user = await getUserFromFirebaseUid(decodedToken.uid);
    
    if (!user) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'User not found in database',
        404
      );
    }

    // Cache the decoded token
    tokenCache.set(token, {
      decoded: decodedToken,
      expiresAt: Date.now() + TOKEN_CACHE_TTL,
    });

    req.user = {
      uid: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid,
      role: user.role,
      plan: user.plan,
    };
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle Firebase specific errors
    if (error instanceof Error) {
      if (error.message.includes('auth/id-token-expired')) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'Token expired',
          401
        );
      }
      if (error.message.includes('auth/id-token-revoked')) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'Token revoked',
          401
        );
      }
      if (error.message.includes('auth/argument-error')) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'Invalid token format',
          401
        );
      }
    }
    
    throw new AppError(
      ErrorCode.AUTHENTICATION_ERROR,
      'Invalid or expired token',
      401
    );
  }
};

async function getUserFromFirebaseUid(firebaseUid: string) {
  return prisma.user.findUnique({
    where: { firebaseUid },
    select: {
      id: true,
      email: true,
      firebaseUid: true,
      role: true,
      plan: true,
    },
  });
}

// RBAC Middleware
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          ErrorCode.AUTHORIZATION_ERROR,
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Error checking user role',
        500
      );
    }
  };
};

export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
export const requirePremium = requireRole('PREMIUM', 'ADMIN', 'SUPER_ADMIN');
export const requireSuperAdmin = requireRole('SUPER_ADMIN');

// Ownership validation middleware
export const requireOwnership = (resourceType: 'strategy' | 'notification' | 'telegram') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Resource ID is required',
          400
        );
      }

      let isOwner = false;

      switch (resourceType) {
        case 'strategy': {
          const strategy = await prisma.strategy.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          isOwner = strategy?.userId === req.user.uid;
          break;
        }

        case 'notification': {
          const notification = await prisma.notificationHistory.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          isOwner = notification?.userId === req.user.uid;
          break;
        }

        case 'telegram': {
          const telegram = await prisma.telegramConnection.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          });
          isOwner = telegram?.userId === req.user.uid;
          break;
        }

        default:
          throw new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Invalid resource type',
            400
          );
      }

      if (!isOwner) {
        throw new AppError(
          ErrorCode.AUTHORIZATION_ERROR,
          'Access denied. You do not own this resource',
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Error checking resource ownership',
        500
      );
    }
  };
};

// Clear expired tokens from cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (data.expiresAt < now) {
      tokenCache.delete(token);
    }
  }
}, 60 * 1000); // Clean every minute
