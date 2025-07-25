import { prisma } from '@/lib/prisma';
import { User } from '@/generated/prisma';
import { InterfaceUserRepository } from './interfaces/interfaceUserRepository';

export class UserRepository implements InterfaceUserRepository {
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async updatePoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: { points },
    });
  }

  async incrementPoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }

  async decrementPoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        points: {
          decrement: points,
        },
      },
    });
  }
}
