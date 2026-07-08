import { userRepository } from '../repository/user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import { AppError } from '../../../common/middlewares/error-handler';
import { ErrorCode } from '../../../common/types/api-response';
import { logger } from '@matchpulse/logger';
import { prisma } from '../../../common/config/prisma';

export class UserService {
  async getProfile(firebaseUid: string): Promise<UserResponseDto> {
    // Try to find by firebaseUid first, then by ID (for dev mode)
    let user = await userRepository.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      user = await userRepository.findById(firebaseUid);
    }
    
    if (!user) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    // Count user's strategies
    const strategiesCount = await prisma.strategy.count({
      where: { userId: user.id }
    });

    logger.info('User profile retrieved', { userId: user.id });
    
    // Return user with strategies count
    return {
      ...user,
      strategiesCount,
    } as UserResponseDto;
  }

  async updateProfile(firebaseUid: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    const updatedUser = await userRepository.update(user.id, data);
    
    logger.info('User profile updated', { userId: user.id });
    return updatedUser as UserResponseDto;
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await userRepository.findByFirebaseUid(data.firebaseUid);
    
    if (existingUser) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'User already exists',
        409
      );
    }

    const existingEmail = await userRepository.findByEmail(data.email);
    
    if (existingEmail) {
      throw new AppError(
        ErrorCode.CONFLICT,
        'Email already in use',
        409
      );
    }

    const user = await userRepository.create(data);
    
    logger.info('User created', { userId: user.id });
    return user as UserResponseDto;
  }

  async deleteAccount(firebaseUid: string): Promise<void> {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'User not found',
        404
      );
    }

    await userRepository.delete(user.id);
    
    logger.info('User account deleted', { userId: user.id });
  }

  async findAll(page: number, pageSize: number) {
    return userRepository.findAll(page, pageSize);
  }

  async syncUser(firebaseUid: string, email: string, name: string): Promise<UserResponseDto> {
    // Check if user already exists by firebaseUid
    let user = await userRepository.findByFirebaseUid(firebaseUid);
    
    if (user) {
      // Update existing user
      user = await userRepository.update(user.id, { name });
      logger.info('User synced (updated)', { userId: user.id });
    } else {
      // Check if user exists by email (for legacy accounts)
      const existingByEmail = await userRepository.findByEmail(email);
      
      if (existingByEmail) {
        // Update existing user with new firebaseUid
        user = await userRepository.update(existingByEmail.id, { firebaseUid, name });
        logger.info('User synced (updated firebaseUid)', { userId: user.id });
      } else {
        // Create new user
        user = await userRepository.create({
          firebaseUid,
          email,
          name,
          plan: 'FREE',
        });
        logger.info('User synced (created)', { userId: user.id });
      }
    }
    
    return user as UserResponseDto;
  }
}

export const userService = new UserService();
