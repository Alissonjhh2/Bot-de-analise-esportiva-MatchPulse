import { prisma } from '../../../common/config/prisma';
import { CreateStrategyDto, UpdateStrategyDto, CreateStrategyConditionDto } from '../dto/strategy.dto';

export class StrategyRepository {
  async findById(id: string) {
    return prisma.strategy.findUnique({
      where: { id },
      include: {
        conditions: true,
      },
    });
  }

  async findByUserId(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.strategy.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          conditions: true,
        },
      }),
      prisma.strategy.count({ where: { userId } }),
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

  async findActiveByUserId(userId: string) {
    return prisma.strategy.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        conditions: true,
      },
    });
  }

  async findActive() {
    return prisma.strategy.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        conditions: true,
      },
    });
  }

  async create(userId: string, data: CreateStrategyDto) {
    const { conditions, ...strategyData } = data;
    
    const strategy = await prisma.strategy.create({
      data: {
        ...strategyData,
        userId,
      },
      include: {
        conditions: true,
      },
    });

    // Create conditions if provided
    if (conditions && conditions.length > 0) {
      await prisma.strategyCondition.createMany({
        data: conditions.map(c => ({
          strategyId: strategy.id,
          indicator: c.indicator,
          team: c.team,
          quantity: c.quantity,
          operator: c.operator,
        })),
      });
    }

    return this.findById(strategy.id);
  }

  async update(id: string, data: UpdateStrategyDto) {
    const { conditions, ...strategyData } = data;
    
    // Update strategy basic data
    await prisma.strategy.update({
      where: { id },
      data: strategyData,
      include: {
        conditions: true,
      },
    });

    // Update conditions if provided
    if (conditions !== undefined) {
      // Delete existing conditions
      await prisma.strategyCondition.deleteMany({
        where: { strategyId: id },
      });

      // Create new conditions
      if (conditions.length > 0) {
        await prisma.strategyCondition.createMany({
          data: conditions.map(c => ({
            strategyId: id,
            indicator: c.indicator,
            team: c.team,
            quantity: c.quantity,
            operator: c.operator,
          })),
        });
      }
    }

    return this.findById(id);
  }

  async delete(id: string) {
    return prisma.strategy.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    return prisma.strategy.update({
      where: { id },
      data: { status },
    });
  }

  async duplicate(id: string, userId: string) {
    const original = await this.findById(id);
    
    if (!original) {
      return null;
    }

    const newStrategy = await prisma.strategy.create({
      data: {
        userId,
        name: `${original.name} (Copy)`,
        description: original.description,
        startMinute: original.startMinute,
        endMinute: original.endMinute,
        status: 'INACTIVE',
        visibility: original.visibility,
      },
      include: {
        conditions: true,
      },
    });

    // Copy conditions
    if (original.conditions && original.conditions.length > 0) {
      await prisma.strategyCondition.createMany({
        data: original.conditions.map((c: any) => ({
          strategyId: newStrategy.id,
          indicator: c.indicator,
          team: c.team,
          quantity: c.quantity,
          operator: c.operator,
        })),
      });
    }

    return this.findById(newStrategy.id);
  }

  async addCondition(strategyId: string, condition: CreateStrategyConditionDto) {
    return prisma.strategyCondition.create({
      data: {
        strategyId,
        indicator: condition.indicator,
        team: condition.team,
        quantity: condition.quantity,
        operator: condition.operator,
      },
    });
  }

  async removeCondition(conditionId: string) {
    return prisma.strategyCondition.delete({
      where: { id: conditionId },
    });
  }
}

export const strategyRepository = new StrategyRepository();
