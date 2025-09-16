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

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
}