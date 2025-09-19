import { prisma } from '@/lib/prisma';
import { PointsHistory, PointsType } from '@/generated/prisma';
import { CreatePointsData, InterfacePointsRepository } from './interface-points.repository';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class PointsRepository implements InterfacePointsRepository {
  
  async create(data: CreatePointsData): Promise<PointsHistory> {
    return await prisma.pointsHistory.create({
      data: {
        userId: data.userId,
        type: data.type,
        pointsAmount: data.pointsAmount,
        usedBoardId: data.usedBoardId,
      },
    });
  }

  async findByUserId(userId: string): Promise<PointsHistory[]> {
    return await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteByUsedBoardId(userId: string, usedBoardId: string): Promise<void> {
    await prisma.pointsHistory.deleteMany({
      where: {
        userId,
        usedBoardId,
        type: PointsType.RECYCLING,
      },
    });
  }

  async getTotalPointsForUser(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return user?.points ?? 0;
  }

  async addPointsToUser(userId: string, amount: number): Promise<number> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: amount,
        },
      },
      select: { points: true },
    });
    return updatedUser.points;
  }

  async createInTransaction(tx: PrismaTransaction, data: CreatePointsData): Promise<PointsHistory> {
    return await tx.pointsHistory.create({
      data: {
        userId: data.userId,
        type: data.type,
        pointsAmount: data.pointsAmount,
        usedBoardId: data.usedBoardId,
      },
    });
  }

  async deleteInTransaction(tx: PrismaTransaction, userId: string, usedBoardId: string): Promise<void> {
    await tx.pointsHistory.deleteMany({
      where: {
        userId,
        usedBoardId,
        type: PointsType.RECYCLING,
      },
    });
  }

  async addPointsToUserInTransaction(tx: PrismaTransaction, userId: string, amount: number): Promise<number> {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: amount,
        },
      },
      select: { points: true },
    });
    return updatedUser.points;
  }
}