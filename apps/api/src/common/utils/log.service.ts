import { prisma } from '../config/prisma';
import { LogLevel } from '@prisma/client';

export class LogService {
  async log(level: LogLevel, source: string, message: string, details?: any) {
    try {
      await prisma.log.create({
        data: {
          level,
          source,
          message,
          details: details || null,
        },
      });
    } catch (error) {
      // Avoid infinite loop if logging fails
      console.error('Failed to save log to database:', error);
    }
  }

  async error(source: string, message: string, details?: any) {
    return this.log(LogLevel.ERROR, source, message, details);
  }

  async warn(source: string, message: string, details?: any) {
    return this.log(LogLevel.WARN, source, message, details);
  }

  async info(source: string, message: string, details?: any) {
    return this.log(LogLevel.INFO, source, message, details);
  }

  async debug(source: string, message: string, details?: any) {
    return this.log(LogLevel.DEBUG, source, message, details);
  }

  async cleanupOldLogs(days: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}

export const logService = new LogService();
