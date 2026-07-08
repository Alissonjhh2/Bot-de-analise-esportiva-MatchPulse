import { telegramRepository } from '../repository/telegram.repository';
import { CreateTelegramConnectionDto, TelegramConnectionResponseDto, TelegramLinkCodeResponseDto } from '../dto/telegram.dto';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';
import { logger } from '@matchpulse/logger';
import crypto from 'crypto';
import { prisma } from '../../../common/config/prisma';

// TODO: Fix import from @matchpulse/constants when path resolution is fixed
const TELEGRAM_CODE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const TELEGRAM_CODE_LENGTH = 6;

// Helper to convert firebaseUid to database userId
async function getDatabaseId(userId: string): Promise<string> {
  // First, try to find by database ID (in case userId is already a database ID)
  const userById = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (userById) {
    return userById.id;
  }

  // If not found, try by firebaseUid
  const user = await prisma.user.findUnique({
    where: { firebaseUid: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      'User not found',
      404
    );
  }

  return user.id;
}

export class TelegramService {
  async getConnection(userId: string): Promise<TelegramConnectionResponseDto | null> {
    // Try to find by userId first (database ID)
    let connection = await telegramRepository.findByUserId(userId);
    
    // If not found, try by firebaseUid (in case userId is actually firebaseUid)
    if (!connection) {
      connection = await telegramRepository.findByFirebaseUid(userId);
    }
    
    return connection as TelegramConnectionResponseDto | null;
  }

  async createConnection(userId: string, data: CreateTelegramConnectionDto): Promise<TelegramConnectionResponseDto> {
    // Convert firebaseUid to database userId if needed
    const dbUserId = await getDatabaseId(userId);
    
    const existingConnection = await telegramRepository.findByUserId(dbUserId);
    
    if (existingConnection) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'User already has a Telegram connection',
        409
      );
    }

    const connection = await telegramRepository.create(
      dbUserId,
      data.chatId,
      data.username,
      data.firstName
    );
    
    logger.info('Telegram connection created', { userId: dbUserId, chatId: data.chatId });
    return connection as TelegramConnectionResponseDto;
  }

  async deleteConnection(userId: string): Promise<void> {
    // Convert firebaseUid to database userId if needed
    const dbUserId = await getDatabaseId(userId);
    
    const connection = await telegramRepository.findByUserId(dbUserId);
    
    if (!connection) {
      // If connection not found, just return success (idempotent)
      logger.info('Telegram connection not found, but returning success (idempotent)', { userId: dbUserId });
      return;
    }

    await telegramRepository.delete(dbUserId);
    
    logger.info('Telegram connection deleted', { userId: dbUserId });
  }

  async generateLinkCode(userId: string): Promise<TelegramLinkCodeResponseDto> {
    // Convert firebaseUid to database userId if needed
    const dbUserId = await getDatabaseId(userId);
    
    // Clean up expired codes first
    await telegramRepository.cleanupExpiredCodes();

    // Generate random code
    const code = crypto.randomBytes(Math.ceil(TELEGRAM_CODE_LENGTH / 2))
      .toString('hex')
      .slice(0, TELEGRAM_CODE_LENGTH)
      .toUpperCase();

    const expiresAt = new Date(Date.now() + TELEGRAM_CODE_EXPIRATION);

    const linkCode = await telegramRepository.createLinkCode(dbUserId, code, expiresAt);
    
    logger.info('Telegram link code generated', { userId: dbUserId, code });
    return linkCode as TelegramLinkCodeResponseDto;
  }

  async verifyLinkCode(code: string): Promise<{ userId: string; chatId?: string } | null> {
    const linkCode = await telegramRepository.findLinkCode(code);
    
    if (!linkCode) {
      return null;
    }

    if (linkCode.used) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'Code already used',
        409
      );
    }

    if (linkCode.expiresAt < new Date()) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Code expired',
        400
      );
    }

    // Mark as used
    await telegramRepository.updateLinkCodeUsed(code);
    
    logger.info('Telegram link code verified', { code, userId: linkCode.userId });
    
    return {
      userId: linkCode.userId,
    };
  }

  async getConnectionByChatId(chatId: string): Promise<TelegramConnectionResponseDto | null> {
    const connection = await telegramRepository.findByChatId(chatId);
    return connection as TelegramConnectionResponseDto | null;
  }
}

export const telegramService = new TelegramService();
