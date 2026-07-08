import { strategyRepository } from '../repository/strategy.repository';
import { CreateStrategyDto, UpdateStrategyDto, StrategyResponseDto } from '../dto/strategy.dto';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';
import { logger } from '@matchpulse/logger';
import { prisma } from '../../../common/config/prisma';

// TODO: Fix import from @matchpulse/constants when path resolution is fixed
const MAX_STRATEGIES_FREE = 1;
const MAX_STRATEGIES_PREMIUM = 10;

export class StrategyService {
  async findById(id: string, userId: string): Promise<StrategyResponseDto> {
    const strategy = await strategyRepository.findById(id);
    
    if (!strategy) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Strategy not found',
        404
      );
    }

    // Check if user owns the strategy or it's public
    if (strategy.userId !== userId && strategy.visibility !== 'PUBLIC') {
      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to access this strategy',
        403
      );
    }

    return strategy as StrategyResponseDto;
  }

  async findByUserId(userId: string, page: number, pageSize: number) {
    return strategyRepository.findByUserId(userId, page, pageSize);
  }

  async create(userId: string, data: CreateStrategyDto): Promise<StrategyResponseDto> {
    // Validate minute interval
    if (data.startMinute > data.endMinute) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Start minute must be less than or equal to end minute',
        400
      );
    }

    // Check if user can create more strategies based on plan
    const userStrategies = await strategyRepository.findByUserId(userId, 1, 100);
    const activeCount = userStrategies.data.filter((s: any) => s.status === 'ACTIVE').length;
    
    // Get user plan from database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isPremium = user?.plan === 'PREMIUM';
    const maxStrategies = isPremium ? MAX_STRATEGIES_PREMIUM : MAX_STRATEGIES_FREE;
    
    if (activeCount >= maxStrategies) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Limite de estratégias atingido. Seu plano atual permite apenas ${maxStrategies} estratégia(s) ativa(s).`,
        400
      );
    }

    const strategy = await strategyRepository.create(userId, data);
    
    if (!strategy) {
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to create strategy',
        500
      );
    }
    
    logger.info('Strategy created', { strategyId: strategy.id, userId });
    return strategy as StrategyResponseDto;
  }

  async update(id: string, userId: string, data: UpdateStrategyDto): Promise<StrategyResponseDto> {
    const strategy = await strategyRepository.findById(id);
    
    if (!strategy) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Strategy not found',
        404
      );
    }

    if (strategy.userId !== userId) {
      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to update this strategy',
        403
      );
    }

    // Validate minute interval if provided
    if (data.startMinute && data.endMinute && data.startMinute > data.endMinute) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Start minute must be less than or equal to end minute',
        400
      );
    }

    const updatedStrategy = await strategyRepository.update(id, data);
    
    logger.info('Strategy updated', { strategyId: id, userId });
    return updatedStrategy as StrategyResponseDto;
  }

  async delete(id: string, userId: string): Promise<void> {
    const strategy = await strategyRepository.findById(id);
    
    if (!strategy) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Strategy not found',
        404
      );
    }

    if (strategy.userId !== userId) {
      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to delete this strategy',
        403
      );
    }

    await strategyRepository.delete(id);
    
    logger.info('Strategy deleted', { strategyId: id, userId });
  }

  async updateStatus(id: string, userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<StrategyResponseDto> {
    const strategy = await strategyRepository.findById(id);
    
    if (!strategy) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Strategy not found',
        404
      );
    }

    if (strategy.userId !== userId) {
      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to update this strategy',
        403
      );
    }

    // Check if activating would exceed limit
    if (status === 'ACTIVE') {
      const userStrategies = await strategyRepository.findByUserId(userId, 1, 100);
      const activeCount = userStrategies.data.filter((s: any) => s.status === 'ACTIVE' && s.id !== id).length;
      
      // TODO: Get user plan from database
      const isPremium = false;
      const maxStrategies = isPremium ? MAX_STRATEGIES_PREMIUM : MAX_STRATEGIES_FREE;
      
      if (activeCount >= maxStrategies) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          `Limite de estratégias atingido. Seu plano atual permite apenas ${maxStrategies} estratégia(s) ativa(s).`,
          400
        );
      }
    }

    const updatedStrategy = await strategyRepository.updateStatus(id, status);
    
    logger.info('Strategy status updated', { strategyId: id, userId, status });
    return updatedStrategy as StrategyResponseDto;
  }

  async duplicate(id: string, userId: string): Promise<StrategyResponseDto> {
    const strategy = await strategyRepository.findById(id);
    
    if (!strategy) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Strategy not found',
        404
      );
    }

    if (strategy.userId !== userId && strategy.visibility !== 'PUBLIC') {
      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to duplicate this strategy',
        403
      );
    }

    const duplicatedStrategy = await strategyRepository.duplicate(id, userId);
    
    if (!duplicatedStrategy) {
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to duplicate strategy',
        500
      );
    }
    
    logger.info('Strategy duplicated', { originalId: id, newId: duplicatedStrategy.id, userId });
    return duplicatedStrategy as StrategyResponseDto;
  }
}

export const strategyService = new StrategyService();
