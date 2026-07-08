import { prisma } from '../../../common/config/prisma';

export class TelegramRepository {
  async findByUserId(userId: string) {
    return prisma.telegramConnection.findUnique({
      where: { userId },
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    return prisma.telegramConnection.findUnique({
      where: { userId: user.id },
    });
  }

  async findByChatId(chatId: string) {
    return prisma.telegramConnection.findUnique({
      where: { chatId },
    });
  }

  async create(userId: string, chatId: string, username?: string, firstName?: string) {
    return prisma.telegramConnection.create({
      data: {
        userId,
        chatId,
        username,
        firstName,
      },
    });
  }

  async delete(userId: string) {
    return prisma.telegramConnection.delete({
      where: { userId },
    });
  }

  async createLinkCode(userId: string, code: string, expiresAt: Date) {
    return prisma.telegramLinkCode.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });
  }

  async findLinkCode(code: string) {
    return prisma.telegramLinkCode.findUnique({
      where: { code },
    });
  }

  async updateLinkCodeUsed(code: string) {
    return prisma.telegramLinkCode.update({
      where: { code },
      data: { used: true },
    });
  }

  async cleanupExpiredCodes() {
    return prisma.telegramLinkCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export const telegramRepository = new TelegramRepository();
