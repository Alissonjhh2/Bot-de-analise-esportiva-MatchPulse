import { Router } from 'express';
import { strategyController } from '../controller/strategy.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateFirebase);

router.get('/', strategyController.findByUserId.bind(strategyController));
router.get('/:id', strategyController.findById.bind(strategyController));
router.post('/', strategyController.create.bind(strategyController));
router.put('/:id', strategyController.update.bind(strategyController));
router.delete('/:id', strategyController.delete.bind(strategyController));
router.patch('/:id/status', strategyController.updateStatus.bind(strategyController));
router.post('/:id/duplicate', strategyController.duplicate.bind(strategyController));

export default router;
