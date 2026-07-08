import { Router } from 'express';
import { notificationController } from '../controller/notification.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateFirebase);

router.get('/', notificationController.findByUserId.bind(notificationController));
router.get('/strategy/:strategyId', notificationController.findByStrategyId.bind(notificationController));

export default router;
