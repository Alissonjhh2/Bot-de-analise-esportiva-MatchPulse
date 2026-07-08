import { Router } from 'express';
import { telegramController } from '../controller/telegram.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';

const router = Router();

// Internal route for Telegram bot (no authentication required)
router.get('/verify-link-code/:code', telegramController.verifyLinkCode.bind(telegramController));

// All routes below require authentication
router.use(authenticateFirebase);

router.get('/', telegramController.getConnection.bind(telegramController));
router.post('/', telegramController.createConnection.bind(telegramController));
router.delete('/', telegramController.deleteConnection.bind(telegramController));
router.post('/link-code', telegramController.generateLinkCode.bind(telegramController));

export default router;
