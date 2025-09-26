import { prisma } from '@/lib/prisma';
import { PointsHistory } from '@/generated/prisma';
import { 
  InterfacePointsHistoryRepository, 
  CreatePointsHistoryData 
} from './interface-points-history.repository';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class PointsHistoryRepository implements InterfacePointsHistoryRepository {
  
  async findByUserId(userId: string): Promise<PointsHistory[]> {
    return await prisma.pointsHistory.findMany({
      where: { 
        userId,
        deletedAt: null 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreatePointsHistoryData): Promise<PointsHistory> {
    return await prisma.pointsHistory.create({
      data: {
        userId: data.userId,
        type: data.type,
        pointsAmount: data.pointsAmount,
        usedBoardId: data.usedBoardId,
      },
    });
  }

  async createInTransaction(
    tx: PrismaTransaction, 
    data: CreatePointsHistoryData
  ): Promise<PointsHistory> {
    return await tx.pointsHistory.create({
      data: {
        userId: data.userId,
        type: data.type,
        pointsAmount: data.pointsAmount,
        usedBoardId: data.usedBoardId,
      },
    });
  }
}