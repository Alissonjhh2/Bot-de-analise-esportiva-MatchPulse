import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../service/notification.service';
import { ApiResponse } from '../../../common/types/api-response';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';
import { logger } from '@matchpulse/logger';

export class NotificationController {
  async findByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await notificationService.findByUserId(userId, page, pageSize);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findByStrategyId(req: Request, res: Response, next: NextFunction) {
    try {
      const { strategyId } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await notificationService.findByStrategyId(strategyId, userId, page, pageSize);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
