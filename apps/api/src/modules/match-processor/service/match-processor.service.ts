import { MatchUpdateEvent } from '../../match-simulator/types/match-simulator.types';
import { RuleEngineService, RuleEngineInput } from '../../rule-engine';
import { strategyRepository } from '../../strategies/repository/strategy.repository';
import { logger } from '@matchpulse/logger';
import { telegramSenderService } from '../../telegram/service/telegram-sender.service';
import { notificationService } from '../../notifications/service/notification.service';

export interface MatchProcessorConfig {
  enableLogging: boolean;
  saveMatchHits: boolean;
}

export class MatchProcessorService {
  private ruleEngine: RuleEngineService;
  private config: MatchProcessorConfig;

  constructor(config?: Partial<MatchProcessorConfig>) {
    this.ruleEngine = new RuleEngineService({ enableLogging: true });
    this.config = {
      enableLogging: config?.enableLogging ?? true,
      saveMatchHits: config?.saveMatchHits ?? true,
    };
  }

  async processMatchUpdate(event: MatchUpdateEvent): Promise<void> {
    try {
      if (this.config.enableLogging) {
        logger.debug(`Processing match update for ${event.matchId} at minute ${event.minute}`);
      }

      // Get all active strategies
      const activeStrategies = await strategyRepository.findActive();

      if (activeStrategies.length === 0) {
        if (this.config.enableLogging) {
          logger.debug('No active strategies to evaluate');
        }
        return;
      }

      if (this.config.enableLogging) {
        logger.info(`Evaluating ${activeStrategies.length} active strategies for match ${event.matchId}`);
      }

      // Evaluate each strategy
      const results = [];
      for (const strategy of activeStrategies) {
        const input: RuleEngineInput = {
          matchId: event.matchId,
          minute: event.minute,
          stats: event.stats,
          strategy: {
            strategyId: strategy.id,
            userId: strategy.userId,
            name: strategy.name,
            description: strategy.description || undefined,
            startMinute: strategy.startMinute,
            endMinute: strategy.endMinute,
            status: strategy.status,
            conditions: strategy.conditions.map((c: { indicator: string; team: string; quantity: number; operator: string }) => ({
              indicator: c.indicator,
              team: c.team,
              quantity: c.quantity,
              operator: c.operator,
            })),
          },
        };

        const result = this.ruleEngine.evaluate(input);
        results.push(result);

        // If strategy matched, save match hit
        if (result.result && this.config.saveMatchHits) {
          await this.saveMatchHit(result, strategy.userId, event.matchId);
        }
      }

      const matchedCount = results.filter((r) => r.result).length;
      if (matchedCount > 0 && this.config.enableLogging) {
        logger.info(`🎯 ${matchedCount} strategies matched for match ${event.matchId} at minute ${event.minute}`);
      }
    } catch (error) {
      logger.error('Error processing match update', error as Error);
    }
  }

  private async saveMatchHit(result: { strategyId: string; strategyName: string; matchedConditions: any[] }, userId: string, matchId: string): Promise<void> {
    try {
      if (this.config.enableLogging) {
        logger.info(`💾 Saving match hit for strategy ${result.strategyId} on match ${matchId}`);
      }

      // Get match details from the event (we need to pass this through)
      // For now, we'll use placeholder data
      const matchName = `Match ${matchId}`;
      const championship = 'Unknown';

      // Format conditions for Telegram message
      const conditions = result.matchedConditions.map(c => 
        `${c.indicator} ${c.team}: ${c.actualValue} ${c.operator} ${c.expectedValue}`
      );

      // Send Telegram notification
      const telegramSent = await telegramSenderService.sendMatchHitNotification(
        userId,
        result.strategyName,
        matchName,
        championship,
        conditions
      );

      if (telegramSent) {
        logger.info('📱 Telegram notification sent successfully', { 
          strategyId: result.strategyId, 
          userId 
        });
      } else {
        logger.warn('⚠️ Telegram notification failed', { 
          strategyId: result.strategyId, 
          userId 
        });
      }

      // Save notification to database
      await notificationService.create(
        userId,
        result.strategyId,
        matchName,
        championship,
        `Estratégia "${result.strategyName}" acionada no jogo ${matchName}`
      );

      if (this.config.enableLogging) {
        logger.info('✅ Match hit saved successfully', { strategyId: result.strategyId });
      }
    } catch (error) {
      logger.error('Error saving match hit', error as Error);
    }
  }
}
