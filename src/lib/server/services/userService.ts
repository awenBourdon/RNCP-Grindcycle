import { User } from '@/generated/prisma';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { InterfaceUserRepository } from '../repositories/interfaces/interfaceUserRepository';
import { prisma } from '@/lib/prisma';
import { UserRepository } from '../repositories/userRepositoty';

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
      await tx.order.updateMany({
        where: { userId },
        data: { userId: null }
      });

      await tx.user.delete({
        where: { id: userId }
      });
    });
  }
}