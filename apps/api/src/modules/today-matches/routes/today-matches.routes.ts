import { Router } from 'express';
import { getTodayMatches } from '../controllers/today-matches.controller';

const router = Router();

// GET /api/v1/today-matches - Get today's matches from ESPN
router.get('/', getTodayMatches);

export default router;
