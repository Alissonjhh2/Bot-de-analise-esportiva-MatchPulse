import { Router } from 'express';
import { userController } from '../controller/user.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';

const router = Router();

// Public routes
router.post('/', userController.create.bind(userController));
router.post('/sync', userController.syncUser.bind(userController));

// Protected routes
router.get('/profile', authenticateFirebase, userController.getProfile.bind(userController));
router.put('/profile', authenticateFirebase, userController.updateProfile.bind(userController));
router.delete('/profile', authenticateFirebase, userController.deleteAccount.bind(userController));

// Admin routes
router.get('/', authenticateFirebase, userController.findAll.bind(userController));

export default router;
