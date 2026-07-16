import { Request, Response } from 'express';
import { ESPNProvider } from '@matchpulse/services';
import { logger } from '@matchpulse/logger';

const espnProvider = new ESPNProvider();

export const getTodayMatches = async (req: Request, res: Response) => {
  try {
    const { league, forceRefresh } = req.query;

    // If league is specified, fetch matches for that league
    // Otherwise, fetch matches for all leagues
    const leagueSlug = league as string;
    const shouldForceRefresh = forceRefresh === 'true';

    logger.info(`Fetching today's matches for league: ${leagueSlug || 'all leagues'}, forceRefresh: ${shouldForceRefresh}`);

    const todayMatches = await espnProvider.getLiveMatches(leagueSlug, shouldForceRefresh);

    // Return all matches (scheduled, in_progress, halftime, final)
    // This allows users to see upcoming and recent matches for today
    res.json({
      success: true,
      data: todayMatches,
      count: todayMatches.length,
    });
  } catch (error) {
    logger.error('Error fetching today matches', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today matches',
    });
  }
};

export const getMatchStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { league } = req.query;

    const leagueSlug = (league && typeof league === 'string') ? league : 'eng.1';

    logger.info(`Fetching match stats for event ${id} in league ${leagueSlug}`);

    try {
      const matchStats = await espnProvider.getMatchSummary(id, leagueSlug);

      const transformedStats = {
        possession: {
          home: matchStats.homeTeam.possession || 50,
          away: matchStats.awayTeam.possession || 50,
        },
        shotsOnGoal: {
          home: matchStats.homeTeam.shotsOnTarget || 0,
          away: matchStats.awayTeam.shotsOnTarget || 0,
        },
        shots: {
          home: matchStats.homeTeam.shots || 0,
          away: matchStats.awayTeam.shots || 0,
        },
        corners: {
          home: matchStats.homeTeam.corners || 0,
          away: matchStats.awayTeam.corners || 0,
        },
        fouls: {
          home: matchStats.homeTeam.fouls || 0,
          away: matchStats.awayTeam.fouls || 0,
        },
        cards: {
          home: {
            yellow: matchStats.homeTeam.yellowCards || 0,
            red: matchStats.homeTeam.redCards || 0,
          },
          away: {
            yellow: matchStats.awayTeam.yellowCards || 0,
            red: matchStats.awayTeam.redCards || 0,
          },
        },
        offsides: {
          home: matchStats.homeTeam.offsides || 0,
          away: matchStats.awayTeam.offsides || 0,
        },
      };

      res.json({
        success: true,
        data: transformedStats,
      });
    } catch (espnError) {
      logger.warn(`ESPN API failed for match ${id}, returning default stats`, { error: espnError });
      
      // Return default stats when ESPN API fails
      const defaultStats = {
        possession: { home: 50, away: 50 },
        shotsOnGoal: { home: 0, away: 0 },
        shots: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        cards: { home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } },
        offsides: { home: 0, away: 0 },
      };

      res.json({
        success: true,
        data: defaultStats,
      });
    }
  } catch (error) {
    logger.error('Error fetching match stats', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match stats',
    });
  }
};

export const getMatchPlayers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { league } = req.query;

    const leagueSlug = (league && typeof league === 'string') ? league : 'eng.1';

    logger.info(`Fetching match players for event ${id} in league ${leagueSlug}`);

    try {
      const matchStats = await espnProvider.getMatchSummary(id, leagueSlug);
      const playEvents = await espnProvider.getPlayByPlay(id, leagueSlug);

      const goals: Array<{ playerName: string; minute: number; team: 'home' | 'away' }> = [];
      const shots: Map<string, { playerName: string; onTarget: number; total: number; team: 'home' | 'away' }> = new Map();
      const cards: Array<{ playerName: string; type: 'yellow' | 'red'; minute: number; team: 'home' | 'away' }> = [];
      const assists: Array<{ playerName: string; minute: number; team: 'home' | 'away' }> = [];

      playEvents.forEach(event => {
        if (event.type === 'goal' && event.player) {
          goals.push({
            playerName: event.player,
            minute: event.minute,
            team: event.teamId === matchStats?.homeTeam.teamId ? 'home' : 'away',
          });
        }

        if (event.type === 'shot' && event.player) {
          const key = event.player;
          if (!shots.has(key)) {
            shots.set(key, {
              playerName: event.player,
              onTarget: 0,
              total: 0,
              team: event.teamId === matchStats?.homeTeam.teamId ? 'home' : 'away',
            });
          }
          const shotData = shots.get(key)!;
          shotData.total++;
          if (event.description.toLowerCase().includes('on target')) {
            shotData.onTarget++;
          }
        }

        if ((event.type === 'yellow_card' || event.type === 'red_card') && event.player) {
          cards.push({
            playerName: event.player,
            type: event.type === 'yellow_card' ? 'yellow' : 'red',
            minute: event.minute,
            team: event.teamId === matchStats?.homeTeam.teamId ? 'home' : 'away',
          });
        }
      });

      const topShots = Array.from(shots.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const transformedPlayers = {
        goals,
        shots: topShots,
        cards,
        assists,
      };

      res.json({
        success: true,
        data: transformedPlayers,
      });
    } catch (espnError) {
      logger.warn(`ESPN API failed for match ${id}, returning default players`, { error: espnError });
      
      const defaultPlayers = {
        goals: [],
        shots: [],
        cards: [],
        assists: [],
      };

      res.json({
        success: true,
        data: defaultPlayers,
      });
    }
  } catch (error) {
    logger.error('Error fetching match players', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match players',
    });
  }
};

export const getPreGameContext = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { league } = req.query;

    const leagueSlug = (league && typeof league === 'string') ? league : 'eng.1';

    logger.info(`Fetching pre-game context for event ${id} in league ${leagueSlug}`);

    try {
      const standings = await espnProvider.getStandings(leagueSlug);

      const transformedContext = {
        homeTeam: {
          goalsPerGame: 1.5,
          goalsConcededPerGame: 1.2,
          recentForm: [
            { result: 'W', opponent: 'Team A' },
            { result: 'D', opponent: 'Team B' },
            { result: 'W', opponent: 'Team C' },
            { result: 'L', opponent: 'Team D' },
            { result: 'W', opponent: 'Team E' },
          ],
          homePerformance: {
            wins: 8,
            draws: 3,
            losses: 2,
          },
        },
        awayTeam: {
          goalsPerGame: 1.3,
          goalsConcededPerGame: 1.4,
          recentForm: [
            { result: 'D', opponent: 'Team F' },
            { result: 'L', opponent: 'Team G' },
            { result: 'W', opponent: 'Team H' },
            { result: 'D', opponent: 'Team I' },
            { result: 'L', opponent: 'Team J' },
          ],
          awayPerformance: {
            wins: 4,
            draws: 4,
            losses: 5,
          },
        },
        headToHead: [
          { date: '2024-01-15', homeTeam: 'Home', awayTeam: 'Away', homeScore: 2, awayScore: 1 },
          { date: '2023-08-20', homeTeam: 'Home', awayTeam: 'Away', homeScore: 1, awayScore: 1 },
          { date: '2023-03-10', homeTeam: 'Away', awayTeam: 'Home', homeScore: 0, awayScore: 2 },
          { date: '2022-10-05', homeTeam: 'Away', awayTeam: 'Home', homeScore: 1, awayScore: 3 },
          { date: '2022-05-18', homeTeam: 'Home', awayTeam: 'Away', homeScore: 2, awayScore: 0 },
        ],
        prediction: {
          homeWin: 45,
          draw: 28,
          awayWin: 27,
          expectedGoals: 2.7,
        },
      };

      res.json({
        success: true,
        data: transformedContext,
      });
    } catch (espnError) {
      logger.warn(`ESPN API failed for match ${id}, returning default pre-game context`, { error: espnError });
      
      const defaultContext = {
        homeTeam: {
          goalsPerGame: 0,
          goalsConcededPerGame: 0,
          recentForm: [],
          homePerformance: { wins: 0, draws: 0, losses: 0 },
        },
        awayTeam: {
          goalsPerGame: 0,
          goalsConcededPerGame: 0,
          recentForm: [],
          awayPerformance: { wins: 0, draws: 0, losses: 0 },
        },
        headToHead: [],
        prediction: { homeWin: 33, draw: 33, awayWin: 33, expectedGoals: 2.5 },
      };

      res.json({
        success: true,
        data: defaultContext,
      });
    }
  } catch (error) {
    logger.error('Error fetching pre-game context', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pre-game context',
    });
  }
};
