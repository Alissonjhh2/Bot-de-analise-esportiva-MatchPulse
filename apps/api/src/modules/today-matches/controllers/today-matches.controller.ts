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
