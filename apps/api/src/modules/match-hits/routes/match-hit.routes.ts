import { Router } from 'express';
import { matchHitController } from '../controller/match-hit.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateFirebase);

router.get('/', matchHitController.findAll.bind(matchHitController));
router.get('/stats', matchHitController.getStats.bind(matchHitController));
router.get('/strategy/:id', matchHitController.findByStrategyId.bind(matchHitController));

export default router;
