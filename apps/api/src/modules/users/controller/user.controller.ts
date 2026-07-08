import { Request, Response, NextFunction } from 'express';
import { userService } from '../service/user.service';
import { ApiResponse } from '../../../common/types/api-response';
import { createUserDto, updateUserDto } from '../dto/user.dto';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';
import { logger } from '@matchpulse/logger';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const user = await userService.getProfile(firebaseUid);
      
      const response: ApiResponse = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const validatedData = updateUserDto.parse(req.body);
      const user = await userService.updateProfile(firebaseUid, validatedData);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createUserDto.parse(req.body);
      const user = await userService.create(validatedData);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const firebaseUid = req.user?.uid;
      
      if (!firebaseUid) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      await userService.deleteAccount(firebaseUid);
      
      const response: ApiResponse = {
        success: true,
        message: 'Account deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await userService.findAll(page, pageSize);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { firebaseUid, email, name } = req.body;
      
      logger.info('Sync user request received', { firebaseUid, email, name });
      
      if (!firebaseUid || !email) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'firebaseUid and email are required',
          400
        );
      }

      const user = await userService.syncUser(firebaseUid, email, name || '');
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User synced successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error in syncUser', { error });
      next(error);
    }
  }
}

export const userController = new UserController();
