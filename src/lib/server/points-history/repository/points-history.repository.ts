import { prisma } from '@/lib/utils/prisma';
import { PointsHistory } from '@/generated/prisma';
import { 
  InterfacePointsHistoryRepository, 
  CreatePointsHistoryData 
} from './interface-points-history.repository';
import { PaginatedResponse, createPaginatedResponse } from '@/lib/utils/pagination';

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

  async findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<PointsHistory>> {
    const skip = (page - 1) * limit;
    
    const where = { 
      userId,
      deletedAt: null 
    };

    const [pointsHistory, total] = await Promise.all([
      prisma.pointsHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pointsHistory.count({ where }),
    ]);

    return createPaginatedResponse(
      pointsHistory,
      total,
      page,
      limit
    );
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