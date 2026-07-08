import { Request, Response, NextFunction } from 'express';
import { strategyService } from '../service/strategy.service';
import { ApiResponse } from '../../../common/types/api-response';
import { createStrategyDto, updateStrategyDto, updateStrategyStatusDto } from '../dto/strategy.dto';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';

export class StrategyController {
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const strategy = await strategyService.findById(id, userId);
      
      const response: ApiResponse = {
        success: true,
        data: strategy,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

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
      
      const result = await strategyService.findByUserId(userId, page, pageSize);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      console.log('[StrategyController] Create request - userId:', userId);
      console.log('[StrategyController] Request body:', JSON.stringify(req.body, null, 2));
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const validatedData = createStrategyDto.parse(req.body);
      console.log('[StrategyController] Validated data:', JSON.stringify(validatedData, null, 2));
      
      const strategy = await strategyService.create(userId, validatedData);
      console.log('[StrategyController] Strategy created:', strategy);
      
      const response: ApiResponse = {
        success: true,
        data: strategy,
        message: 'Strategy created successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('[StrategyController] Error creating strategy:', error);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const validatedData = updateStrategyDto.parse(req.body);
      const strategy = await strategyService.update(id, userId, validatedData);
      
      const response: ApiResponse = {
        success: true,
        data: strategy,
        message: 'Strategy updated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      await strategyService.delete(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Strategy deleted successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const validatedData = updateStrategyStatusDto.parse(req.body);
      const strategy = await strategyService.updateStatus(id, userId, validatedData.status);
      
      const response: ApiResponse = {
        success: true,
        data: strategy,
        message: 'Strategy status updated successfully',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) {
        throw new AppError(
          ErrorCode.AUTHENTICATION_ERROR,
          'User not authenticated',
          401
        );
      }

      const strategy = await strategyService.duplicate(id, userId);
      
      const response: ApiResponse = {
        success: true,
        data: strategy,
        message: 'Strategy duplicated successfully',
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const strategyController = new StrategyController();
