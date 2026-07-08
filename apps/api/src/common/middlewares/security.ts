import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const setupSecurity = (app: any) => {
  // Commented out for development - CORS is handled in index.ts
  // app.use(helmet());

  // CORS configuration - handled in index.ts to avoid conflicts
  // app.use(
  //   cors({
  //     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  //     credentials: true,
  //   })
  // );

  // Rate limiting - disabled for development
  // app.use(rateLimiter);
};
