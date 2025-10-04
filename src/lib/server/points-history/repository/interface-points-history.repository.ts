import { PointsHistory, PointsType } from '@/generated/prisma';
import { PaginatedResponse } from '@/lib/utils/pagination';

export interface CreatePointsHistoryData {
  userId: string;
  type: PointsType;
  pointsAmount: number;
  usedBoardId?: string | null;
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/utils/prisma').prisma.$transaction>[0]>[0];

export interface InterfacePointsHistoryRepository {
  findByUserId(userId: string): Promise<PointsHistory[]>;
  findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<PaginatedResponse<PointsHistory>>;
  create(data: CreatePointsHistoryData): Promise<PointsHistory>;
  createInTransaction(tx: PrismaTransaction, data: CreatePointsHistoryData): Promise<PointsHistory>;
}