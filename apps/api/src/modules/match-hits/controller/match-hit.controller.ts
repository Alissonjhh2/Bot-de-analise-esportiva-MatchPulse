import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../common/config/prisma';

export class MatchHitController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const matchHits = await prisma.matchHit.findMany({
        where: {
          strategy: {
            userId: userId,
          },
        },
        include: {
          strategy: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.matchHit.count({
        where: {
          strategy: {
            userId: userId,
          },
        },
      });

      res.json({
        data: matchHits,
        meta: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async findByStrategyId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const strategyId = req.params.id;

      const matchHits = await prisma.matchHit.findMany({
        where: {
          strategyId: strategyId,
          strategy: {
            userId: userId,
          },
        },
        include: {
          strategy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });

      res.json(matchHits);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const [totalHits, activeStrategies, todayHits] = await Promise.all([
        prisma.matchHit.count({
          where: {
            strategy: {
              userId: userId,
            },
          },
        }),
        prisma.strategy.count({
          where: {
            userId: userId,
            status: 'ACTIVE',
          },
        }),
        prisma.matchHit.count({
          where: {
            strategy: {
              userId: userId,
            },
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      res.json({
        totalHits,
        activeStrategies,
        todayHits,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const matchHitController = new MatchHitController();
