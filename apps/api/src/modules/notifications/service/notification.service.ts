import { notificationRepository } from '../repository/notification.repository';
import { NotificationHistoryResponseDto } from '../dto/notification.dto';
import { logger } from '@matchpulse/logger';

// TODO: Fix import from @matchpulse/constants when path resolution is fixed
const MAX_NOTIFICATION_HISTORY_DAYS = 30;

export class NotificationService {
  async findByUserId(userId: string, page: number, pageSize: number) {
    return notificationRepository.findByUserId(userId, page, pageSize);
  }

  async findByStrategyId(strategyId: string, userId: string, page: number, pageSize: number) {
    // Verify user owns the strategy
    // TODO: Add strategy ownership check
    return notificationRepository.findByStrategyId(strategyId, page, pageSize);
  }

  async create(userId: string, strategyId: string, matchName: string, championship: string, message: string) {
    const notification = await notificationRepository.create(
      userId,
      strategyId,
      matchName,
      championship,
      message
    );
    
    logger.info('Notification created', { notificationId: notification.id, userId, strategyId });
    return notification as NotificationHistoryResponseDto;
  }

  async cleanupOldNotifications() {
    const result = await notificationRepository.deleteOldNotifications(MAX_NOTIFICATION_HISTORY_DAYS);
    logger.info('Old notifications cleaned up', { count: result.count });
    return result;
  }
}

export const notificationService = new NotificationService();
