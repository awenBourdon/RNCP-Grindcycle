import { prisma } from '@/lib/prisma';
import { UsedBoard, PointsType, BoardType, BoardCondition } from '@/generated/prisma';
import {
  CreateUsedBoardData,
  UpdateUsedBoardData,
  UsedBoardFilters,
  UsedBoardWithRelations,
} from '@/lib/server/types/usedBoard';
import { InterfaceUsedBoardRepository } from './interface-used-boards.repository';
import { pointsService } from '../../points/points.service';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const POINTS_BAREME = {
  SKATE: { GOOD: 80, AVERAGE: 60, BAD: 40 },
  CRUISER: { GOOD: 90, AVERAGE: 70, BAD: 50 },
  LONG: { GOOD: 100, AVERAGE: 80, BAD: 60 }
} as const;

function calculatePoints(boardType: BoardType, condition: BoardCondition): number {
  return POINTS_BAREME[boardType][condition];
}

export class UsedBoardRepository implements InterfaceUsedBoardRepository {
  async create(data: CreateUsedBoardData): Promise<UsedBoard> {
    return await prisma.usedBoard.create({
      data: {
        userId: data.userId,
        name: data.name,
        boardCondition: data.boardCondition,
        boardType: data.boardType,
        description: data.description || null,
        image: data.image,
        status: data.status || 'PENDING_VALIDATION',
        pointsAwarded: data.pointsAwarded || null,
      },
    });
  }

  async findById(id: string): Promise<UsedBoardWithRelations | null> {
    return await prisma.usedBoard.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(filters?: UsedBoardFilters): Promise<UsedBoardWithRelations[]> {
    const where: Record<string, unknown> = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters?.boardType && filters.boardType.length > 0) {
      where.boardType = { in: filters.boardType };
    }

    if (filters?.boardCondition && filters.boardCondition.length > 0) {
      where.boardCondition = { in: filters.boardCondition };
    }

    if (filters?.hasProduct !== undefined) {
      where.product = filters.hasProduct ? { isNot: null } : { is: null };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.usedBoard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: Partial<UpdateUsedBoardData>
  ): Promise<UsedBoardWithRelations> {
    return await prisma.usedBoard.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.usedBoard.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<UsedBoardWithRelations[]> {
    return this.findAll({ userId });
  }

  async updateWithPointsTransaction(
    boardId: string,
    updateData: Partial<UpdateUsedBoardData>,
    oldBoard: UsedBoardWithRelations
  ): Promise<UsedBoardWithRelations> {
    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      
      if (updateData.status === 'RECEIVED' && oldBoard.status !== 'RECEIVED') {
        const autoPoints = calculatePoints(
          oldBoard.boardType, 
          oldBoard.boardCondition || 'AVERAGE'
        );
        updateData.pointsAwarded = autoPoints;
      }

      const updatedBoard = await tx.usedBoard.update({
        where: { id: boardId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      const statusChanged = oldBoard.status !== updatedBoard.status;

      if (statusChanged && updatedBoard.userId) {
        const pointsRepository = pointsService.getRepository();

        if (updatedBoard.status === 'RECEIVED' && oldBoard.status !== 'RECEIVED') {
          await pointsRepository.deleteInTransaction(tx, updatedBoard.userId, boardId);
          const pointsToAward = updatedBoard.pointsAwarded || 50;

          if (pointsToAward > 0) {
            await pointsRepository.createInTransaction(tx, {
              userId: updatedBoard.userId,
              type: PointsType.RECYCLING,
              pointsAmount: pointsToAward,
              usedBoardId: boardId,
            });
            await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, pointsToAward);
          }
        } 
      }
      else if (
        updateData.pointsAwarded !== undefined &&
        updatedBoard.status === 'RECEIVED' &&
        updatedBoard.userId
      ) {
        const pointsRepository = pointsService.getRepository();
        
        const oldPointsEntries = await tx.pointsHistory.findMany({
          where: { userId: updatedBoard.userId, usedBoardId: boardId, type: PointsType.RECYCLING },
          select: { pointsAmount: true },
        });
        const oldTotal = oldPointsEntries.reduce((sum, p) => sum + p.pointsAmount, 0);
        
        await pointsRepository.deleteInTransaction(tx, updatedBoard.userId, boardId);

        if (updatedBoard.pointsAwarded && updatedBoard.pointsAwarded > 0) {
          await pointsRepository.createInTransaction(tx, {
            userId: updatedBoard.userId,
            type: PointsType.RECYCLING,
            pointsAmount: updatedBoard.pointsAwarded,
            usedBoardId: boardId,
          });

          const difference = updatedBoard.pointsAwarded - oldTotal;
          if (difference !== 0) {
            await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, difference);
          }
        } else if (oldTotal > 0) {
          await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, -oldTotal);
        }
      }

      return updatedBoard;
    });
  }

  async deleteWithPointsTransaction(
    boardId: string,
    board: UsedBoardWithRelations
  ): Promise<void> {
    await prisma.$transaction(async (tx: PrismaTransaction) => {
      if (board.pointsAwarded && board.pointsAwarded > 0 && board.user) {
        const pointsRepository = pointsService.getRepository();
        
        const pointsEntries = await tx.pointsHistory.findMany({
          where: {
            userId: board.user.id,
            usedBoardId: boardId,
            type: PointsType.RECYCLING,
          },
          select: { pointsAmount: true },
        });

        const totalPoints = pointsEntries.reduce((sum, p) => sum + p.pointsAmount, 0);
        
        await pointsRepository.deleteInTransaction(tx, board.user.id, boardId);
        
        if (totalPoints > 0) {
          await pointsRepository.addPointsToUserInTransaction(tx, board.user.id, -totalPoints);
        }
      }

      await tx.usedBoard.delete({
        where: { id: boardId },
      });
    });
  }

  async findUserById(userId: string): Promise<{ name: string | null } | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
  }
}