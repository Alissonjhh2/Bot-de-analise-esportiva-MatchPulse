import { userRepository } from '../../users/repository/user.repository';
import { userService } from '../../users/service/user.service';
import { CreateUserDto } from '../../users/dto/user.dto';
import { logger } from '@matchpulse/logger';

export class AuthService {
  async handleFirebaseAuth(firebaseUid: string, email: string, name: string) {
    let user = await userRepository.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      // Create new user
      const createUserData: CreateUserDto = {
        firebaseUid,
        email,
        name,
      };
      
      user = await userService.create(createUserData);
      logger.info('New user created from Firebase auth', { firebaseUid, email });
    } else {
      // Update user info if needed
      if (user.email !== email || user.name !== name) {
        user = await userRepository.update(user.id, {
          email,
          name,
        });
        logger.info('User info updated from Firebase auth', { firebaseUid });
      }
    }
    
    return user;
  }
}

export const authService = new AuthService();
