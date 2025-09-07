import { User } from '@/generated/prisma';
import { UserRepository } from '@/lib/server/repositories/userRepositoty';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { InterfaceUserRepository } from '../repositories/interfaces/interfaceUserRepository';
import { prisma } from '@/lib/prisma';

export class UserService {
  constructor(
    private userRepository: InterfaceUserRepository = new UserRepository()
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error(API_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async updateUserPoints(id: string, points: number): Promise<User> {
    await this.getUserById(id);

    return await this.userRepository.updatePoints(id, points);
  }

  async incrementUserPoints(id: string, points: number): Promise<User> {
    await this.getUserById(id);

    return await this.userRepository.incrementPoints(id, points);
  }

  async decrementUserPoints(id: string, points: number): Promise<User> {
    const user = await this.getUserById(id);

    if (user.points < points) {
      throw new Error(API_MESSAGES.INSUFFICIENT_POINTS);
    }

    return await this.userRepository.decrementPoints(id, points);
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: now }
      });

      await tx.usedBoard.updateMany({
        where: { userId },
        data: { userId: null }
      });

      await tx.pointsHistory.deleteMany({
        where: { userId }
      });

      await tx.order.updateMany({
        where: { userId },
        data: { userId: null }
      });

      await tx.notification.deleteMany({
        where: { userId }
      });

      await tx.favorite.deleteMany({
        where: { userId }
      });

      await tx.session.deleteMany({
        where: { userId }
      });

      await tx.account.deleteMany({
        where: { userId }
      });
    });
  }
}