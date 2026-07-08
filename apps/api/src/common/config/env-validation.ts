import { z } from 'zod';

// Environment validation schema with Zod
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),

  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),

  // Firebase (optional in development, required in production)
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required').optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email('Invalid FIREBASE_CLIENT_EMAIL').optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required').optional(),

  // API
  API_BASE_URL: z.string().url('Invalid API_BASE_URL').default('http://localhost:4000'),

  // Telegram (optional)
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required').optional(),

  // Authentication
  AUTH_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),

  // Redis (required for production)
  REDIS_URL: z.string().url('Invalid REDIS_URL').optional(),

  // CORS
  FRONTEND_URL: z.string().url('Invalid FRONTEND_URL').default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().transform(val => val.split(',').map(s => s.trim())).default('http://localhost:3000'),

  // Feature Flags
  ENABLE_RATE_LIMITING: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  ENABLE_IP_CONTROL: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  ENABLE_AUDIT_LOG: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),

  // Security
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment at startup - Fail Fast
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation for production
    if (env.NODE_ENV === 'production') {
      // REDIS_URL is optional for initial deployment
      // if (!env.REDIS_URL) {
      //   throw new Error('REDIS_URL is required in production');
      // }
      // SESSION_SECRET is optional for initial deployment
      // if (!env.SESSION_SECRET) {
      //   throw new Error('SESSION_SECRET is required in production');
      // }
      if (env.AUTH_ENABLED !== true) {
        throw new Error('AUTH_ENABLED must be true in production');
      }
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration. See errors above.');
    }
    throw error;
  }
}

export const env = validateEnv();
