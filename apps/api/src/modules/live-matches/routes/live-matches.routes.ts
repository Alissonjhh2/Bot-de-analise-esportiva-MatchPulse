import { Router } from 'express';
import { getLiveMatches } from '../controllers/live-matches.controller';

const router = Router();

// GET /api/v1/live-matches - Get live matches from ESPN
router.get('/', getLiveMatches);

export default router;
