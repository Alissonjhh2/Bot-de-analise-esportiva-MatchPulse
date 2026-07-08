import { prisma } from '../config/prisma';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class LogService {
  async log(level: LogLevel, source: string, message: string, details?: unknown) {
    try {
      await prisma.log.create({
        data: {
          level,
          source,
          message,
          details: details as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      });
    } catch (error) {
      // Avoid infinite loop if logging fails
      console.error('Failed to save log to database:', error);
    }
  }

  async error(source: string, message: string, details?: unknown) {
    return this.log(LogLevel.ERROR, source, message, details);
  }

  async warn(source: string, message: string, details?: unknown) {
    return this.log(LogLevel.WARN, source, message, details);
  }

  async info(source: string, message: string, details?: unknown) {
    return this.log(LogLevel.INFO, source, message, details);
  }

  async debug(source: string, message: string, details?: unknown) {
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
