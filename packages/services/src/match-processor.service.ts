import { MatchUpdateEvent, RuleEngineService, RuleEngineInput } from './index';

export interface MatchProcessorConfig {
  enableLogging: boolean;
  saveMatchHits: boolean;
}

export interface MatchProcessorResult {
  strategyId: string;
  result: boolean;
  minute: number;
  strategy: any;
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

  async processMatchUpdate(event: MatchUpdateEvent, strategies?: any[]): Promise<MatchProcessorResult[]> {
    try {
      if (this.config.enableLogging) {
        console.log(`Processing match update for ${event.matchId} at minute ${event.minute}`);
      }

      // If no strategies provided, skip evaluation
      if (!strategies || strategies.length === 0) {
        if (this.config.enableLogging) {
          console.log('No strategies provided for evaluation');
        }
        return [];
      }

      if (this.config.enableLogging) {
        console.log(`Evaluating ${strategies.length} strategies for match ${event.matchId}`);
      }

      // Evaluate each strategy
      const results: MatchProcessorResult[] = [];
      for (const strategy of strategies) {
        const input: RuleEngineInput = {
          matchId: event.matchId,
          minute: event.minute,
          stats: event.stats,
          strategy: {
            strategyId: strategy.strategyId || strategy.id,
            userId: strategy.userId,
            name: strategy.name,
            description: strategy.description,
            startMinute: strategy.startMinute,
            endMinute: strategy.endMinute,
            status: strategy.status,
            conditions: strategy.conditions || [],
          },
        };

        const result = this.ruleEngine.evaluate(input);
        results.push({
          strategyId: result.strategyId,
          result: result.result,
          minute: event.minute,
          strategy: strategy,
        });
      }

      const matchedCount = results.filter((r) => r.result).length;
      if (matchedCount > 0 && this.config.enableLogging) {
        console.log(`🎯 ${matchedCount} strategies matched for match ${event.matchId} at minute ${event.minute}`);
      }

      return results;
    } catch (error) {
      console.error('Error processing match update', error);
      return [];
    }
  }

  evaluateConditions(snapshot: any, conditions: any[]): boolean {
    try {
      // Create a rule engine input from snapshot
      const input: RuleEngineInput = {
        matchId: snapshot.matchId,
        minute: snapshot.minute,
        stats: snapshot,
        strategy: {
          strategyId: 'temp',
          userId: 'temp',
          name: 'temp',
          description: '',
          startMinute: 0,
          endMinute: 90,
          status: 'ACTIVE',
          conditions: conditions || [],
        },
      };

      const result = this.ruleEngine.evaluate(input);
      return result.result;
    } catch (error) {
      console.error('Error evaluating conditions', error);
      return false;
    }
  }
}
