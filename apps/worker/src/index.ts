import { logger } from '@matchpulse/logger';
import { scheduler } from './scheduler';
import { MatchProcessorService, ESPNProvider } from '@matchpulse/services';
import { prisma } from './lib/prisma';
import { telegramBotService } from './services/telegram-bot.service';
import express from 'express';

// Cooldown tracking to prevent spam - 1 notification per match per strategy
const notifiedMatches = new Map<string, Set<string>>(); // strategyId -> Set of matchIds

// Worker for background tasks:
// - Fetching live matches from ESPN API
// - Evaluating strategies with Rule Engine
// - Processing match updates with Match Processor
// - Saving match hits to database
// - Sending Telegram notifications

// Health check server for Render
const healthCheckApp = express();
const PORT = process.env.PORT || 10000;

healthCheckApp.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

class MatchPulseWorker {
  private isRunning = false;
  private espnProvider: ESPNProvider;
  private matchProcessor: MatchProcessorService;
  private strategies: any[] = [];
  private strategyRefreshInterval: NodeJS.Timeout | null = null;
  private matchCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize ESPN Provider
    this.espnProvider = new ESPNProvider();

    // Initialize Match Processor
    this.matchProcessor = new MatchProcessorService({
      enableLogging: true,
      saveMatchHits: true,
    });
  }

  private calculateOffensivePressure(
    totalShots: number,
    shotsOnTarget: number,
    cornerKicks: number,
    possessionPct: number
  ): number {
    // Normalize values to 0-1 range based on typical maximums
    const normalizedShots = Math.min(totalShots / 30, 1); // max ~30 shots
    const normalizedShotsOnTarget = Math.min(shotsOnTarget / 15, 1); // max ~15 shots on target
    const normalizedCorners = Math.min(cornerKicks / 15, 1); // max ~15 corners
    const normalizedPossession = possessionPct / 100; // max 100%

    // Calculate offensive pressure using weighted formula
    const pressure = 
      (normalizedShots * 0.25) +
      (normalizedShotsOnTarget * 0.40) +
      (normalizedCorners * 0.20) +
      (normalizedPossession * 0.15);

    // Scale to 0-100
    return Math.round(pressure * 100);
  }

  async fetchActiveStrategies() {
    try {
      const strategies = await prisma.strategy.findMany({
        where: { status: 'ACTIVE' },
        include: {
          conditions: true,
        },
      });

      this.strategies = strategies.map((strategy: any) => ({
        id: strategy.id,
        strategyId: strategy.id,
        userId: strategy.userId,
        name: strategy.name,
        description: strategy.description,
        startMinute: strategy.startMinute,
        endMinute: strategy.endMinute,
        status: strategy.status,
        leagues: (strategy.leagues as string[]) || ['bra.1'],
        conditions: strategy.conditions.map((condition: any) => ({
          indicator: condition.indicator.toLowerCase(),
          team: condition.team.toLowerCase(),
          quantity: condition.quantity,
          operator: condition.operator.toLowerCase(),
        })),
      }));

      logger.info(`📋 Loaded ${this.strategies.length} active strategies from database`);
      
      if (this.strategies.length > 0) {
        this.strategies.forEach(strategy => {
          logger.info(`Strategy: ${strategy.name}, ID: ${strategy.id}, Leagues: ${strategy.leagues.join(', ')}`);
          logger.info(`Conditions: ${JSON.stringify(strategy.conditions)}`);
        });
      }
    } catch (error) {
      logger.error('Error fetching strategies from database', error as Error);
    }
  }

  async saveMatchHit(matchId: string, strategyId: string, minute: number, snapshot: any) {
    try {
      await prisma.matchHit.create({
        data: {
          matchId,
          strategyId,
          minute,
          result: true,
          snapshot,
        },
      });
      logger.info(`💾 Saved match hit: ${strategyId} at minute ${minute}`);
    } catch (error) {
      logger.error('Error saving match hit', error as Error);
    }
  }

  async sendTelegramNotification(matchId: string, strategy: any, minute: number, snapshot: any, matchStatus: string = 'in_progress') {
    try {
      // Block notifications during penalties
      if (matchStatus === 'STATUS_AFTER_SHOOTOUT' || matchStatus === 'STATUS_FINAL_PEN') {
        logger.info(`⏸️ Match ${matchId} is in penalties - blocking notifications`);
        return;
      }

      logger.info(`📤 Attempting to send Telegram notification for strategy ${strategy.name} to user ${strategy.userId}`);

      // Check if this match was already notified for this strategy
      if (!notifiedMatches.has(strategy.id)) {
        notifiedMatches.set(strategy.id, new Set());
      }
      const strategyNotifiedMatches = notifiedMatches.get(strategy.id)!;
      
      if (strategyNotifiedMatches.has(matchId)) {
        logger.info(`⏸️ Match ${matchId} already notified for strategy ${strategy.id}`);
        return;
      }

      // Get user's Telegram connection
      const connection = await prisma.telegramConnection.findUnique({
        where: { userId: strategy.userId },
      });

      if (!connection) {
        logger.info(`📱 No Telegram connection for user ${strategy.userId}`);
        return;
      }

      logger.info(`✅ Found Telegram connection: chatId=${connection.chatId}`);

      // Format message
      const message = this.formatTelegramMessage(strategy, matchId, minute, snapshot);

      // Send via Telegram bot service
      await telegramBotService.sendNotification(strategy.userId, message);

      // Mark this match as notified for this strategy
      strategyNotifiedMatches.add(matchId);
      logger.info(`✅ Match ${matchId} marked as notified for strategy ${strategy.id}`);
    } catch (error) {
      logger.error('Error sending Telegram notification', error as Error);
    }
  }

  formatTelegramMessage(strategy: any, matchId: string, minute: number, snapshot: any): string {
    const matchName = this.getMatchName(matchId, snapshot);
    const competition = this.getCompetitionName(snapshot);
    const score = this.getScore(snapshot);
    const corners = this.getCorners(snapshot);
    const offensivePressure = this.getOffensivePressure(snapshot);
    const shotsOnGoal = this.getShotsOnGoal(snapshot);
    const cards = this.getCards(snapshot);
    const fouls = this.getFouls(snapshot);
    const offsides = this.getOffsides(snapshot);
    const ballPossession = this.getBallPossession(snapshot);

    return `
🎯 MATCHPULSE ALERT

📊 Alerta Estratégia: ${strategy.name}

🏆 Competição: ${competition}

⚽ Jogo: ${matchName}

⏱️ Tempo: ${minute}'

📈 Resultado: ${score}

📐 Escanteios: ${corners}

🔥 Pressão Ofensiva: ${offensivePressure}

🎯 Chutes a Gol: ${shotsOnGoal}

🟨 Cartões: ${cards}

🚨 Faltas: ${fouls}

🚧 Impedimentos: ${offsides}

📊 Posse de Bola: ${ballPossession}

🔥 Detalhes: UM JOGO FOI ENCONTRADO COM SEU FILTRO!!!
    `.trim();
  }

  getMatchName(_matchId: string, snapshot: any): string {
    // Try to get team names from snapshot
    if (snapshot && snapshot.homeTeam && snapshot.awayTeam) {
      return `${snapshot.homeTeam} X ${snapshot.awayTeam}`;
    }
    return 'Partida ao Vivo';
  }

  getCompetitionName(snapshot: any): string {
    // Try to get competition from snapshot
    if (snapshot && snapshot.competition) {
      return snapshot.competition;
    }
    return 'Competição';
  }

  getScore(snapshot: any): string {
    // Try to get score from snapshot
    if (snapshot && snapshot.goals_home !== undefined && snapshot.goals_away !== undefined) {
      return `${snapshot.goals_home} - ${snapshot.goals_away}`;
    }
    return '0 - 0';
  }

  getCorners(snapshot: any): string {
    // Try to get corners from snapshot
    if (snapshot && snapshot.corners_home !== undefined && snapshot.corners_away !== undefined) {
      return `${snapshot.corners_home} - ${snapshot.corners_away}`;
    }
    return '0 - 0';
  }

  getOffensivePressure(snapshot: any): string {
    // Try to get offensive pressure from snapshot
    if (snapshot && snapshot.offensive_pressure_home !== undefined && snapshot.offensive_pressure_away !== undefined) {
      return `${snapshot.offensive_pressure_home}/100 - ${snapshot.offensive_pressure_away}/100`;
    }
    return '0/100 - 0/100';
  }

  getShotsOnGoal(snapshot: any): string {
    // Try to get shots on goal from snapshot
    if (snapshot && snapshot.shots_on_target_home !== undefined && snapshot.shots_on_target_away !== undefined) {
      return `${snapshot.shots_on_target_home} - ${snapshot.shots_on_target_away}`;
    }
    return '0 - 0';
  }

  getCards(snapshot: any): string {
    // Try to get cards from snapshot (yellow + red cards)
    if (snapshot) {
      const homeCards = (snapshot.yellow_cards_home || 0) + (snapshot.red_cards_home || 0);
      const awayCards = (snapshot.yellow_cards_away || 0) + (snapshot.red_cards_away || 0);
      return `${homeCards} - ${awayCards}`;
    }
    return '0 - 0';
  }

  getFouls(snapshot: any): string {
    // Try to get fouls from snapshot
    if (snapshot && snapshot.fouls_home !== undefined && snapshot.fouls_away !== undefined) {
      return `${snapshot.fouls_home} - ${snapshot.fouls_away}`;
    }
    return '0 - 0';
  }

  getOffsides(snapshot: any): string {
    // Try to get offsides from snapshot
    if (snapshot && snapshot.offsides_home !== undefined && snapshot.offsides_away !== undefined) {
      return `${snapshot.offsides_home} - ${snapshot.offsides_away}`;
    }
    return '0 - 0';
  }

  getBallPossession(snapshot: any): string {
    // Try to get ball possession from snapshot
    if (snapshot && snapshot.ball_possession_home !== undefined && snapshot.ball_possession_away !== undefined) {
      return `${Math.round(snapshot.ball_possession_home)}% - ${Math.round(snapshot.ball_possession_away)}%`;
    }
    return '50% - 50%';
  }

  getIndicatorLabel(indicator: string): string {
    const labels: Record<string, string> = {
      goals: 'Gols',
      corners: 'Escanteios',
      dangerous_attacks: 'Ataques Perigosos',
      shots_on_goal: 'Chutes a Gol',
      cards: 'Cartões',
      fouls: 'Faltas',
      offsides: 'Impedimentos',
      ball_possession: 'Posse de Bola',
    };
    return labels[indicator] || indicator;
  }

  getOperatorLabel(operator: string): string {
    const labels: Record<string, string> = {
      more: '>',
      less: '<',
      any: '=',
    };
    return labels[operator] || operator;
  }

  async checkLiveMatches() {
    try {
      logger.info('🔍 Checking for live matches from ESPN API...');

      // Get all unique leagues from active strategies
      const uniqueLeagues = Array.from(
        new Set(this.strategies.flatMap(s => s.leagues))
      );

      if (uniqueLeagues.length === 0) {
        logger.warn('No leagues configured in strategies');
        return;
      }

      logger.info(`Monitoring leagues: ${uniqueLeagues.join(', ')}`);

      // Fetch live matches for all monitored leagues
      for (const league of uniqueLeagues) {
        try {
          logger.info(`🏆 Fetching live matches for league: ${league}`);
          const liveMatches = await this.espnProvider.getLiveMatches(league);
          logger.info(`Found ${liveMatches.length} live matches in ${league}`);

          // Filter matches that are actually in progress
          const inProgressMatches = liveMatches.filter(
            match => match.status === 'in_progress' || match.status === 'halftime'
          );

          logger.info(`${inProgressMatches.length} matches in progress in ${league}`);

          // Process each live match
          for (const match of inProgressMatches) {
            logger.info(`⚽ Processing match: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.eventId})`);
            await this.processLiveMatch(match);
          }
        } catch (error) {
          logger.error(`Error fetching matches for league ${league}`, error as Error);
        }
      }
    } catch (error) {
      logger.error('Error checking live matches', error as Error);
    }
  }

  async processLiveMatch(match: any) {
    try {
      logger.info(`Processing match ${match.eventId}: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      logger.info(`Match status: ${match.status}, Clock: ${match.clock}`);

      // Get match summary from ESPN
      let matchStats;
      try {
        matchStats = await this.espnProvider.getMatchSummary(match.eventId, match.league);
        logger.info(`Match stats retrieved for ${match.eventId}`);
      } catch (error) {
        logger.warn(`Failed to get match summary for ${match.eventId}, using basic match data instead`);
        // Use basic match data when summary is not available
        matchStats = {
          homeTeam: {
            corners: 0,
            shots: 0,
            shotsOnTarget: 0,
            yellowCards: 0,
            redCards: 0,
            fouls: 0,
            offsides: 0,
            possession: 50,
          },
          awayTeam: {
            corners: 0,
            shots: 0,
            shotsOnTarget: 0,
            yellowCards: 0,
            redCards: 0,
            fouls: 0,
            offsides: 0,
            possession: 50,
          },
        };
      }

      // Convert to format expected by rule engine
      const snapshot = {
        matchId: match.eventId,
        minute: parseInt(match.clock) || 0,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.leagueName,
        goals_home: match.homeTeam.score,
        goals_away: match.away.score,
        corners_home: matchStats.homeTeam.corners,
        corners_away: matchStats.awayTeam.corners,
        offensive_pressure_home: this.calculateOffensivePressure(
          matchStats.homeTeam.shots,
          matchStats.homeTeam.shotsOnTarget,
          matchStats.homeTeam.corners,
          matchStats.homeTeam.possession
        ),
        offensive_pressure_away: this.calculateOffensivePressure(
          matchStats.awayTeam.shots,
          matchStats.awayTeam.shotsOnTarget,
          matchStats.awayTeam.corners,
          matchStats.awayTeam.possession
        ),
        shots_on_target_home: matchStats.homeTeam.shotsOnTarget,
        shots_on_target_away: matchStats.awayTeam.shotsOnTarget,
        yellow_cards_home: matchStats.homeTeam.yellowCards,
        yellow_cards_away: matchStats.awayTeam.yellowCards,
        red_cards_home: matchStats.homeTeam.redCards,
        red_cards_away: matchStats.awayTeam.redCards,
        fouls_home: matchStats.homeTeam.fouls,
        fouls_away: matchStats.awayTeam.fouls,
        offsides_home: matchStats.homeTeam.offsides,
        offsides_away: matchStats.awayTeam.offsides,
        ball_possession_home: matchStats.homeTeam.possession,
        ball_possession_away: matchStats.awayTeam.possession,
      };

      logger.info(`Snapshot created: ${JSON.stringify(snapshot)}`);

      // Filter strategies that include this league
      const applicableStrategies = this.strategies.filter(
        strategy => strategy.leagues.includes(match.league)
      );

      logger.info(`Found ${applicableStrategies.length} applicable strategies for this match`);

      // Process with rule engine
      for (const strategy of applicableStrategies) {
        logger.info(`🎯 Evaluating strategy: ${strategy.name} (${strategy.id})`);
        await this.evaluateStrategy(strategy, snapshot, match.status);
      }
    } catch (error) {
      logger.error(`Error processing match ${match.eventId}`, error as Error);
    }
  }

  async evaluateStrategy(strategy: any, snapshot: any, matchStatus: string = 'in_progress') {
    try {
      logger.info(`Evaluating strategy ${strategy.name} for match ${snapshot.matchId} at minute ${snapshot.minute}`);
      logger.info(`Strategy time range: ${strategy.startMinute} - ${strategy.endMinute}`);
      logger.info(`Strategy conditions: ${JSON.stringify(strategy.conditions)}`);

      // Check if match is within strategy's time range
      const minute = snapshot.minute;
      if (minute < strategy.startMinute || minute > strategy.endMinute) {
        logger.info(`⏸️ Match minute ${minute} outside strategy range ${strategy.startMinute}-${strategy.endMinute}`);
        return;
      }

      logger.info(`✅ Match minute ${minute} within strategy range`);

      // Evaluate conditions using match processor
      const result = await this.matchProcessor.evaluateConditions(
        snapshot,
        strategy.conditions
      );

      logger.info(`🎯 Strategy evaluation result: ${result}`);

      if (result) {
        logger.info(`🎯 Strategy ${strategy.name} matched for match ${snapshot.matchId}`);
        await this.saveMatchHit(
          snapshot.matchId,
          strategy.id,
          minute,
          snapshot
        );
        await this.sendTelegramNotification(
          snapshot.matchId,
          strategy,
          minute,
          snapshot,
          matchStatus
        );
      } else {
        logger.info(`❌ Strategy ${strategy.name} did not match for match ${snapshot.matchId}`);
      }
    } catch (error) {
      logger.error(`Error evaluating strategy ${strategy.id}`, error as Error);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('MatchPulse Worker started');

    // Start health check server for Render
    healthCheckApp.listen(PORT, () => {
      logger.info(`Health check server listening on port ${PORT}`);
    });

    // Start Telegram bot polling
    await telegramBotService.startPolling();

    // Fetch strategies from database
    await this.fetchActiveStrategies();

    // Refresh strategies every 30 seconds
    this.strategyRefreshInterval = setInterval(() => {
      this.fetchActiveStrategies();
    }, 30000);

    // Check live matches every 30 seconds
    this.matchCheckInterval = setInterval(() => {
      this.checkLiveMatches();
    }, 30000);

    // Start scheduler
    scheduler.start();

    logger.info('🎮 ESPN Provider active - fetching live matches in real-time');
    logger.info('🧠 Rule Engine active - evaluating strategies from database');
    logger.info('💾 Match hits will be saved to PostgreSQL');
    logger.info('📱 Telegram bot active - listening for /start commands');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Stop Telegram bot polling
    telegramBotService.stopPolling();

    // Clear strategy refresh interval
    if (this.strategyRefreshInterval) {
      clearInterval(this.strategyRefreshInterval);
      this.strategyRefreshInterval = null;
    }

    // Clear match check interval
    if (this.matchCheckInterval) {
      clearInterval(this.matchCheckInterval);
      this.matchCheckInterval = null;
    }

    // Stop scheduler
    scheduler.stop();

    // Disconnect Prisma
    await prisma.$disconnect();

    logger.info('MatchPulse Worker stopped');
  }
}

const worker = new MatchPulseWorker();

// Start worker
worker.start().catch((error) => {
  logger.error('Failed to start worker:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});
