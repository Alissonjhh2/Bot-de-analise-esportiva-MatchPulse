import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './common/config/swagger';
import { errorHandler, notFoundHandler } from './common/middlewares/error-handler';
import { setupSecurity } from './common/middlewares/security';
import { logger } from '@matchpulse/logger';
import getPort from 'get-port';
import { env } from './common/config/env-validation';
import { healthCheck, readinessCheck, livenessCheck } from './common/utils/health-check';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/users/routes/user.routes';
import strategyRoutes from './modules/strategies/routes/strategy.routes';
import telegramRoutes from './modules/telegram/routes/telegram.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import matchHitRoutes from './modules/match-hits/routes/match-hit.routes';
import liveMatchesRoutes from './modules/live-matches/routes/live-matches.routes';
import todayMatchesRoutes from './modules/today-matches/routes/today-matches.routes';
import { getMatchStats, getMatchPlayers, getPreGameContext } from './modules/today-matches/controllers/today-matches.controller';

// Initialize Firebase Admin - Optional in development, required in production
try {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    logger.info('Firebase Admin initialized successfully');
  } else {
    logger.warn('Firebase credentials not provided. Firebase features will be disabled.');
  }
} catch (error) {
  logger.error('Failed to initialize Firebase Admin', error as Error);
  if (env.NODE_ENV === 'production') {
    throw new Error('Firebase Admin initialization failed. Check credentials.');
  }
  logger.warn('Continuing without Firebase in development mode');
}

const app = express();
const isDevelopment = env.NODE_ENV !== 'production';

// CORS configuration - Whitelist based
const allowedOrigins = env.ALLOWED_ORIGINS;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

logger.info(`CORS configured for origins: ${allowedOrigins.join(', ')}`);

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security headers
setupSecurity(app);

// Request logging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path} from ${req.ip}`);
  console.log(`[API] Headers:`, JSON.stringify(req.headers, null, 2));
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/alive', livenessCheck);

// API Routes
logger.info('Registering API routes...');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/strategies', strategyRoutes);
app.use('/api/v1/telegram', telegramRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/match-hits', matchHitRoutes);
app.use('/api/v1/live-matches', liveMatchesRoutes);
app.use('/api/v1/today-matches', todayMatchesRoutes);

// Match details routes (for compatibility with frontend)
app.get('/api/v1/matches/:id/stats', getMatchStats);
app.get('/api/v1/matches/:id/players', getMatchPlayers);
app.get('/api/v1/matches/:id/pre-game', getPreGameContext);

logger.info('API routes registered successfully');

// Swagger documentation (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger documentation available at /api-docs');
}

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server with port fallback logic
async function startServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`🚀 MatchPulse API rodando em http://localhost:${port}`);
      logger.info(`🌍 Ambiente: ${env.NODE_ENV}`);
      if (env.NODE_ENV === 'development') {
        logger.info(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
      }
      resolve();
    });

    server.on('error', async (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        if (isDevelopment) {
          logger.warn(`⚠ Porta ${port} já está em uso`);
          logger.info(`🔁 Buscando porta alternativa disponível...`);
          
          try {
            const availablePort = await getPort({ port: port + 1 });
            logger.info(`✅ Porta alternativa encontrada: ${availablePort}`);
            
            // Try again with the new port
            await startServer(availablePort);
            resolve();
          } catch (fallbackError) {
            logger.error('❌ Falha ao encontrar porta disponível', fallbackError as Error);
            reject(error);
          }
        } else {
          logger.error(`❌ Porta ${port} já está em uso em produção. Encerrando.`);
          reject(error);
        }
      } else {
        logger.error('❌ Erro ao iniciar servidor', error);
        reject(error);
      }
    });
  });
}

// Start the server
startServer(env.PORT).catch((error) => {
  logger.error('❌ Falha ao iniciar servidor', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
