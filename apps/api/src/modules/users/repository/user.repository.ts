import { prisma } from '../../../common/config/prisma';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

export class UserRepository {
  async findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserDto) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findAll(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export const userRepository = new UserRepository();
