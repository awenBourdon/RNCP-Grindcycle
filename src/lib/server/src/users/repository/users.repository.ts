import { prisma } from '@/lib/prisma';
import { User } from '@/generated/prisma';
import {
  InterfaceUserRepository,
  UpdateUserData
} from './interface-users.repository';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class UserRepository implements InterfaceUserRepository {

  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { 
        email,
        deletedAt: null 
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async updatePoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }

  async updatePointsInTransaction(
    tx: PrismaTransaction, 
    id: string, 
    points: number
  ): Promise<User> {
    return await tx.user.update({
      where: { id },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }

  // TODO : appeler les repositorys
  async deleteWithRelationsCleanup(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.usedBoard.updateMany({
        where: { userId: id },
        data: { userId: undefined }
      });

      await tx.order.updateMany({
        where: { userId: id },
        data: { userId: null },
      });

      await tx.favorite.deleteMany({
        where: { userId: id },
      });

      await tx.notification.deleteMany({
        where: { userId: id },
      });

      await tx.session.deleteMany({
        where: { userId: id },
      });

      await tx.account.deleteMany({
        where: { userId: id },
      });

      await tx.user.delete({
        where: { id },
      });
    });
  }
}