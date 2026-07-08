import { Request, Response, NextFunction } from 'express';
import { telegramService } from '../service/telegram.service';
import { ApiResponse } from '../../../common/types/api-response';
import { createTelegramConnectionDto } from '../dto/telegram.dto';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';

export class TelegramController {
  async getConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const connection = await telegramService.getConnection(userId);
      
      const response: ApiResponse = {
        success: true,
        data: connection,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const validatedData = createTelegramConnectionDto.parse(req.body);
      const connection = await telegramService.createConnection(userId, validatedData);
      
      const response: ApiResponse = {
        success: true,
        data: connection,
        message: 'Telegram connection created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      await telegramService.deleteConnection(userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Telegram connection deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async generateLinkCode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const linkCode = await telegramService.generateLinkCode(userId);
      
      const response: ApiResponse = {
        success: true,
        data: linkCode,
        message: 'Link code generated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyLinkCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      
      const result = await telegramService.verifyLinkCode(code);
      
      if (!result) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          'Invalid code',
          404
        );
      }
      
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

export const telegramController = new TelegramController();
