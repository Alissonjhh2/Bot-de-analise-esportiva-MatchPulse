import { Request, Response, NextFunction } from 'express';
import { authService } from '../service/auth.service';
import { ApiResponse } from '../../../common/types/api-response';
import { logger } from '@matchpulse/logger';

export class AuthController {
  async handleFirebaseAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { firebaseUid, email, name } = req.body;
      
      const user = await authService.handleFirebaseAuth(firebaseUid, email, name);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Authentication successful',
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
