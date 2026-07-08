import { Router } from 'express';
import { telegramController } from '../controller/telegram.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';
import { telegramVerifyRateLimiter } from '../../../common/middlewares/rate-limit';
import { ipControl } from '../../../common/middlewares/ip-control';

const router = Router();

// Internal route for Telegram bot (no authentication required but protected)
router.get(
  '/verify-link-code/:code',
  ipControl,
  telegramVerifyRateLimiter,
  telegramController.verifyLinkCode.bind(telegramController)
);

// All routes below require authentication
router.use(authenticateFirebase);

router.get('/', telegramController.getConnection.bind(telegramController));
router.post('/', telegramController.createConnection.bind(telegramController));
router.delete('/', telegramController.deleteConnection.bind(telegramController));
router.post('/link-code', telegramController.generateLinkCode.bind(telegramController));

export default router;
