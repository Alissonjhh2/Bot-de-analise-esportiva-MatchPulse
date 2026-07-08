import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './common/config/swagger';
import { errorHandler, notFoundHandler } from './common/middlewares/error-handler';
import { setupSecurity } from './common/middlewares/security';
import { logger } from '@matchpulse/logger';
import getPort from 'get-port';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/users/routes/user.routes';
import strategyRoutes from './modules/strategies/routes/strategy.routes';
import telegramRoutes from './modules/telegram/routes/telegram.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import matchHitRoutes from './modules/match-hits/routes/match-hit.routes';
import liveMatchesRoutes from './modules/live-matches/routes/live-matches.routes';

dotenv.config();

// Initialize Firebase Admin
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    logger.info('Firebase Admin initialized');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', error as Error);
  }
} else {
  logger.warn('Firebase Admin credentials not provided, Firebase features will be limited');
}

const app = express();
const DEFAULT_PORT = 4000;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS configuration - FIRST middleware
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

logger.info('CORS enabled for all origins in development');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check
app.get('/health', (req, res) => {
  console.log('[API] Health check requested');
  res.json({ status: 'ok', message: 'MatchPulse API is running' });
});

// API Routes
logger.info('Registering API routes...');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/strategies', strategyRoutes);
app.use('/api/v1/telegram', telegramRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/match-hits', matchHitRoutes);
app.use('/api/v1/live-matches', liveMatchesRoutes);
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
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.NODE_ENV === 'development') {
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
startServer(PORT).catch((error) => {
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
