import { Router } from 'express';
import { getTodayMatches, getMatchStats, getMatchPlayers, getPreGameContext } from '../controllers/today-matches.controller';

const router = Router();

// GET /api/v1/today-matches - Get today's matches from ESPN
router.get('/', getTodayMatches);

// GET /api/v1/today-matches/matches/:id/stats - Get match statistics
router.get('/matches/:id/stats', getMatchStats);

// GET /api/v1/today-matches/matches/:id/players - Get match player statistics
router.get('/matches/:id/players', getMatchPlayers);

// GET /api/v1/today-matches/matches/:id/pre-game - Get pre-game context
router.get('/matches/:id/pre-game', getPreGameContext);

export default router;
