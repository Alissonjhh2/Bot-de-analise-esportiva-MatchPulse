import { prisma } from '../../../common/config/prisma';

export class NotificationRepository {
  async findByUserId(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.notificationHistory.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { sentAt: 'desc' },
      }),
      prisma.notificationHistory.count({ where: { userId } }),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findByStrategyId(strategyId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.notificationHistory.findMany({
        where: { strategyId },
        skip,
        take: pageSize,
        orderBy: { sentAt: 'desc' },
      }),
      prisma.notificationHistory.count({ where: { strategyId } }),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(userId: string, strategyId: string, matchName: string, championship: string, message: string) {
    return prisma.notificationHistory.create({
      data: {
        userId,
        strategyId,
        matchName,
        championship,
        message,
      },
    });
  }

  async deleteOldNotifications(days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prisma.notificationHistory.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}

export const notificationRepository = new NotificationRepository();
