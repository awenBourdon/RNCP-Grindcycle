// src/lib/server/src/points/repository/interface-points.repository.ts
import { PointsHistory, PointsType } from '@/generated/prisma';

export interface CreatePointsData {
  userId: string;
  type: PointsType;
  pointsAmount: number;
  usedBoardId?: string | null;
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/prisma').prisma.$transaction>[0]>[0];

export interface InterfacePointsRepository {
  // Historique des points (pour traçabilité)
  create(data: CreatePointsData): Promise<PointsHistory>;
  findByUserId(userId: string): Promise<PointsHistory[]>;
  deleteByUsedBoardId(userId: string, usedBoardId: string): Promise<void>;
  
  getTotalPointsForUser(userId: string): Promise<number>;
  addPointsToUser(userId: string, amount: number): Promise<number>;
  
  createInTransaction(tx: PrismaTransaction, data: CreatePointsData): Promise<PointsHistory>;
  deleteInTransaction(tx: PrismaTransaction, userId: string, usedBoardId: string): Promise<void>;
  addPointsToUserInTransaction(tx: PrismaTransaction, userId: string, amount: number): Promise<number>;
}