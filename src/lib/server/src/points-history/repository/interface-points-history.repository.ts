import { PointsHistory, PointsType } from '@/generated/prisma';

export interface CreatePointsHistoryData {
  userId: string;
  type: PointsType;
  pointsAmount: number;
  usedBoardId?: string | null;
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/prisma').prisma.$transaction>[0]>[0];

export interface InterfacePointsHistoryRepository {
 
  findByUserId(userId: string): Promise<PointsHistory[]>;

  create(data: CreatePointsHistoryData): Promise<PointsHistory>;

  createInTransaction(tx: PrismaTransaction, data: CreatePointsHistoryData): Promise<PointsHistory>;
}