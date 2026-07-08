import { Request, Response } from 'express';
import { ESPNProvider } from '@matchpulse/services';
import { logger } from '@matchpulse/logger';

const espnProvider = new ESPNProvider();

export const getLiveMatches = async (req: Request, res: Response) => {
  try {
    const { league } = req.query;

    // If league is specified, fetch matches for that league
    // Otherwise, fetch matches for all leagues
    const leagueSlug = league as string;

    logger.info(`Fetching live matches for league: ${leagueSlug || 'all leagues'}`);

    const liveMatches = await espnProvider.getLiveMatches(leagueSlug);

    // Return all matches (scheduled, in_progress, halftime, final)
    // This allows users to see upcoming and recent matches
    res.json({
      success: true,
      data: liveMatches,
      count: liveMatches.length,
    });
  } catch (error) {
    logger.error('Error fetching live matches', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live matches',
    });
  }
};
