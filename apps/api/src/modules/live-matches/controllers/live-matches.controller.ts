import { Request, Response } from 'express';
import { ESPNProvider } from '@matchpulse/services';
import { logger } from '@matchpulse/logger';

const espnProvider = new ESPNProvider();

export const getLiveMatches = async (req: Request, res: Response) => {
  try {
    const { league } = req.query;

    // If league is specified, fetch matches for that league
    // Otherwise, fetch matches for all leagues (default to Brazilian league)
    const leagueSlug = (league as string) || 'bra.1';

    logger.info(`Fetching live matches for league: ${leagueSlug}`);

    const liveMatches = await espnProvider.getLiveMatches(leagueSlug);

    // Filter only in-progress matches
    const inProgressMatches = liveMatches.filter(
      match => match.status === 'in_progress' || match.status === 'halftime'
    );

    res.json({
      success: true,
      data: inProgressMatches,
      count: inProgressMatches.length,
    });
  } catch (error) {
    logger.error('Error fetching live matches', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live matches',
    });
  }
};
