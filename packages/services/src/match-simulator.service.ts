import { Match, MatchStats, MatchUpdateEvent, MatchSimulatorConfig } from './match-simulator.types';

export class MatchSimulatorService {
  private matches: Map<string, Match> = new Map();
  private config: MatchSimulatorConfig;
  private updateInterval: NodeJS.Timeout | null = null;
  private eventCallbacks: ((event: MatchUpdateEvent) => void)[] = [];

  constructor(config?: Partial<MatchSimulatorConfig>) {
    this.config = {
      updateInterval: config?.updateInterval || 15, // 15 seconds default
      maxMatches: config?.maxMatches || 5,
      teams: config?.teams || [
        'Flamengo',
        'Palmeiras',
        'Corinthians',
        'São Paulo',
        'Santos',
        'Grêmio',
        'Internacional',
        'Atlético-MG',
        'Fluminense',
        'Botafogo',
      ],
      championships: config?.championships || [
        'Brasileirão Série A',
        'Copa do Brasil',
        'Libertadores',
      ],
    };
  }

  start(): void {
    if (this.updateInterval) {
      console.warn('Match Simulator is already running');
      return;
    }

    console.log('Starting Match Simulator Engine');
    
    // Initialize with some matches
    this.initializeMatches();

    // Start update loop
    this.updateInterval = setInterval(() => {
      this.updateAllMatches();
    }, this.config.updateInterval * 1000);

    console.log(`Match Simulator started with ${this.config.updateInterval}s interval`);
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Match Simulator stopped');
    }
  }

  onMatchUpdate(callback: (event: MatchUpdateEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  getAllMatches(): Match[] {
    return Array.from(this.matches.values());
  }

  private initializeMatches(): void {
    const numMatches = Math.min(this.config.maxMatches, 5);
    
    for (let i = 0; i < numMatches; i++) {
      const homeTeam = this.config.teams[Math.floor(Math.random() * this.config.teams.length)];
      let awayTeam = this.config.teams[Math.floor(Math.random() * this.config.teams.length)];
      
      // Ensure different teams
      while (awayTeam === homeTeam) {
        awayTeam = this.config.teams[Math.floor(Math.random() * this.config.teams.length)];
      }

      const championship = this.config.championships[Math.floor(Math.random() * this.config.championships.length)];
      const matchId = `match_${Date.now()}_${i}`;

      const match: Match = {
        matchId,
        homeTeam,
        awayTeam,
        championship,
        minute: 0,
        status: 'not_started',
        stats: this.createInitialStats(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.matches.set(matchId, match);
      console.log(`Initialized match: ${homeTeam} vs ${awayTeam} (${championship})`);
    }
  }

  private createInitialStats(): MatchStats {
    return {
      goals_home: 0,
      goals_away: 0,
      corners_home: 0,
      corners_away: 0,
      offensive_pressure_home: 0,
      offensive_pressure_away: 0,
      shots_on_target_home: 0,
      shots_on_target_away: 0,
      fouls_home: 0,
      fouls_away: 0,
      yellow_cards_home: 0,
      yellow_cards_away: 0,
      red_cards_home: 0,
      red_cards_away: 0,
      offsides_home: 0,
      offsides_away: 0,
      ball_possession_home: 50,
      ball_possession_away: 50,
    };
  }

  private updateAllMatches(): void {
    this.matches.forEach((match) => {
      this.updateMatch(match);
    });
  }

  private updateMatch(match: Match): void {
    // Skip if match is already finished
    if (match.status === 'finished') {
      return;
    }

    // Start match if not started
    if (match.status === 'not_started') {
      match.status = 'live';
      console.log(`Match started: ${match.homeTeam} vs ${match.awayTeam}`);
    }

    // Increment minute
    match.minute++;

    // Update stats with realistic progression
    this.updateStats(match);

    // Check if match should end
    if (match.minute >= 90) {
      match.status = 'finished';
      console.log(`Match finished: ${match.homeTeam} ${match.stats.goals_home} - ${match.stats.goals_away} ${match.awayTeam}`);
    }

    match.updatedAt = new Date();

    // Emit update event only if match is not finished
    if (match.status !== 'finished') {
      const event: MatchUpdateEvent = {
        matchId: match.matchId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        championship: match.championship,
        minute: match.minute,
        stats: match.stats,
        timestamp: new Date(),
      };

      this.emitEvent(event);
    }
  }

  private updateStats(match: Match): void {
    const stats = match.stats;
    const minute = match.minute;

    // Possibilities based on game progression
    const cornerProbability = 0.1;
    const foulProbability = 0.15;
    const cardProbability = 0.02;
    const goalProbability = 0.05; // Increased from 0.01 to 0.05 (5% chance per update)
    const shotsOnTargetProbability = 0.15;

    // Corners
    if (Math.random() < cornerProbability) {
      if (Math.random() < 0.5) {
        stats.corners_home++;
      } else {
        stats.corners_away++;
      }
    }

    // Shots on target
    if (Math.random() < shotsOnTargetProbability) {
      if (Math.random() < 0.5) {
        stats.shots_on_target_home++;
      } else {
        stats.shots_on_target_away++;
      }
    }

    // Fouls
    if (Math.random() < foulProbability) {
      if (Math.random() < 0.5) {
        stats.fouls_home++;
      } else {
        stats.fouls_away++;
      }
    }

    // Yellow cards
    if (Math.random() < cardProbability) {
      if (Math.random() < 0.5) {
        stats.yellow_cards_home++;
      } else {
        stats.yellow_cards_away++;
      }
    }

    // Red cards (rare)
    if (Math.random() < cardProbability * 0.1) {
      if (Math.random() < 0.5) {
        stats.red_cards_home++;
      } else {
        stats.red_cards_away++;
      }
    }

    // Offsides
    if (Math.random() < foulProbability * 0.5) {
      if (Math.random() < 0.5) {
        stats.offsides_home++;
      } else {
        stats.offsides_away++;
      }
    }

    // Ball possession (fluctuates around 50-50)
    const possessionChange = (Math.random() - 0.5) * 2;
    stats.ball_possession_home = Math.max(30, Math.min(70, stats.ball_possession_home + possessionChange));
    stats.ball_possession_away = 100 - stats.ball_possession_home;

    // Goals (rare but impactful)
    if (Math.random() < goalProbability) {
      if (Math.random() < 0.5) {
        stats.goals_home++;
        console.log(`⚽ GOAL! ${match.homeTeam} scores! ${match.homeTeam} ${stats.goals_home} - ${stats.goals_away} ${match.awayTeam}`);
      } else {
        stats.goals_away++;
        console.log(`⚽ GOAL! ${match.awayTeam} scores! ${match.homeTeam} ${stats.goals_home} - ${stats.goals_away} ${match.awayTeam}`);
      }
    }
  }

  private emitEvent(event: MatchUpdateEvent): void {
    this.eventCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in match update callback', error);
      }
    });
  }

  resetMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    if (match) {
      match.minute = 0;
      match.status = 'not_started';
      match.stats = this.createInitialStats();
      match.updatedAt = new Date();
      console.log(`Reset match: ${match.homeTeam} vs ${match.awayTeam}`);
    }
  }

  removeMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    if (match) {
      this.matches.delete(matchId);
      console.log(`Removed match: ${match.homeTeam} vs ${match.awayTeam}`);
    }
  }
}
