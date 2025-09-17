import { prisma } from '@/lib/prisma';
import { UsedBoard, PointsType } from '@/generated/prisma';
import {
  CreateUsedBoardData,
  UpdateUsedBoardData,
  UsedBoardFilters,
  UsedBoardWithRelations,
} from '@/lib/server/types/usedBoard';
import { InterfaceUsedBoardRepository } from './interfaces/interfaceUsedBoardRepository';

type PrismaTransaction = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

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

  // Nouvelle méthode pour gérer la transaction complexe de mise à jour avec points
  async updateWithPointsTransaction(
    boardId: string,
    updateData: Partial<UpdateUsedBoardData>,
    oldBoard: UsedBoardWithRelations
  ): Promise<UsedBoardWithRelations> {
    return await prisma.$transaction(async (tx: PrismaTransaction) => {
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
      const pointsEligibleStatuses = [
        'RECEIVED',
        'RECYCLED_TO_PRODUCT',
        'SOLD',
      ];
      const noPointsStatuses = [
        'PENDING_VALIDATION',
        'VALIDATED',
        'REJECTED',
        'SENT',
      ];

      if (statusChanged) {
        if (
          pointsEligibleStatuses.includes(updatedBoard.status) &&
          !pointsEligibleStatuses.includes(oldBoard.status) &&
          updatedBoard.userId !== null
        ) {
          await this.awardPoints(tx, updatedBoard, oldBoard, boardId);
        } else if (noPointsStatuses.includes(updatedBoard.status)) {
          await this.removePoints(tx, updatedBoard, boardId);
        }

        if (updatedBoard.userId) {
          await this.recalculateUserPoints(tx, updatedBoard.userId);
        }
      } else if (
        updateData.pointsAwarded !== undefined &&
        pointsEligibleStatuses.includes(updatedBoard.status)
      ) {
        await this.updatePointsOnly(tx, updatedBoard, boardId);
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
        await tx.pointsHistory.deleteMany({
          where: {
            userId: board.user.id,
            usedBoardId: boardId,
            type: 'RECYCLING',
          },
        });
        await this.recalculateUserPoints(tx, board.user.id);
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

  private async awardPoints(
    tx: PrismaTransaction,
    updatedBoard: UsedBoardWithRelations & {
      user: {
        id: string;
        name: string | null;
        email: string;
      } | null;
      product: {
        id: string;
        name: string;
        status: string;
      } | null;
    },
    oldBoard: UsedBoardWithRelations,
    boardId: string
  ): Promise<void> {
    if (!updatedBoard.userId) {
      return;
    }

    const existingTransaction = await tx.pointsHistory.findFirst({
      where: {
        userId: updatedBoard.userId,
        usedBoardId: boardId,
        type: 'RECYCLING',
      },
    });

    const pointsToAward =
      updatedBoard.pointsAwarded || oldBoard.pointsAwarded || 50;

    if (!existingTransaction && pointsToAward > 0) {
      if (!updatedBoard.pointsAwarded && pointsToAward > 0) {
        await tx.usedBoard.update({
          where: { id: boardId },
          data: { pointsAwarded: pointsToAward },
        });
      }

      await tx.pointsHistory.create({
        data: {
          userId: updatedBoard.userId,
          usedBoardId: boardId,
          type: PointsType.RECYCLING,
          pointsAmount: pointsToAward,
        },
      });
    }
  }

  private async removePoints(
    tx: PrismaTransaction,
    updatedBoard: UsedBoardWithRelations & {
      user: {
        id: string;
        name: string | null;
        email: string;
      } | null;
      product: {
        id: string;
        name: string;
        status: string;
      } | null;
    },
    boardId: string
  ): Promise<void> {
    if (!updatedBoard.userId) return;

    await tx.pointsHistory.deleteMany({
      where: {
        userId: updatedBoard.userId,
        usedBoardId: boardId,
        type: 'RECYCLING',
      },
    });

    await tx.usedBoard.update({
      where: { id: boardId },
      data: { pointsAwarded: 0 },
    });
  }

  private async updatePointsOnly(
    tx: PrismaTransaction,
    updatedBoard: UsedBoardWithRelations & {
      user: {
        id: string;
        name: string | null;
        email: string;
      } | null;
      product: {
        id: string;
        name: string;
        status: string;
      } | null;
    },
    boardId: string
  ): Promise<void> {
    if (!updatedBoard.userId) return;

    await tx.pointsHistory.deleteMany({
      where: {
        userId: updatedBoard.userId,
        usedBoardId: boardId,
        type: 'RECYCLING',
      },
    });

    if (updatedBoard.pointsAwarded && updatedBoard.pointsAwarded > 0) {
      await tx.pointsHistory.create({
        data: {
          userId: updatedBoard.userId,
          usedBoardId: boardId,
          type: PointsType.RECYCLING,
          pointsAmount: updatedBoard.pointsAwarded,
        },
      });
    }

    await this.recalculateUserPoints(tx, updatedBoard.userId);
  }

  private async recalculateUserPoints(
    tx: PrismaTransaction,
    userId: string
  ): Promise<void> {
    const totalPoints = await tx.pointsHistory.aggregate({
      where: { userId },
      _sum: { pointsAmount: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        points: totalPoints._sum.pointsAmount ?? 0,
      },
    });
  }
}