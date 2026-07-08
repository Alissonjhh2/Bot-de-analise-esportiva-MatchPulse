import { Router, Request, Response } from 'express';
import { authController } from '../controller/auth.controller';
import { authenticateFirebase } from '../../../common/middlewares/auth';

const router = Router();

// Public route for Firebase authentication
router.post('/firebase', authController.handleFirebaseAuth.bind(authController));

// Protected route to get current user info
router.get('/me', authenticateFirebase, async (req: Request, res: Response) => {
  const response = {
    success: true,
    data: {
      uid: req.user?.uid,
      email: req.user?.email,
    },
  };
  res.json(response);
});

export default router;
