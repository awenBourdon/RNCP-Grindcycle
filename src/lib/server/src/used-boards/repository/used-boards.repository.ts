// src/lib/server/src/used-boards/repository/used-boards.repository.ts
import { prisma } from '@/lib/prisma';
import { UsedBoard, PointsType } from '@/generated/prisma';
import {
  CreateUsedBoardData,
  UpdateUsedBoardData,
  UsedBoardFilters,
  UsedBoardWithRelations,
} from '@/lib/server/types/usedBoard';
import { InterfaceUsedBoardRepository } from './interface-used-boards.repository';
import { pointsService } from '../../points/points.service';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

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

      if (statusChanged && updatedBoard.userId) {
        const pointsRepository = pointsService.getRepository();

        if (
          pointsEligibleStatuses.includes(updatedBoard.status) &&
          !pointsEligibleStatuses.includes(oldBoard.status)
        ) {
          // Supprimer les anciens points de l'historique
          await pointsRepository.deleteInTransaction(tx, updatedBoard.userId, boardId);

          const pointsToAward = updatedBoard.pointsAwarded || oldBoard.pointsAwarded || 50;

          if (pointsToAward > 0) {
            // Créer nouvelle entrée dans l'historique
            await pointsRepository.createInTransaction(tx, {
              userId: updatedBoard.userId,
              type: PointsType.RECYCLING,
              pointsAmount: pointsToAward,
              usedBoardId: boardId,
            });

            // Ajouter les points à l'utilisateur
            await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, pointsToAward);

            if (!updatedBoard.pointsAwarded) {
              await tx.usedBoard.update({
                where: { id: boardId },
                data: { pointsAwarded: pointsToAward },
              });
            }
          }

        } else if (noPointsStatuses.includes(updatedBoard.status)) {
          // Récupérer les points à supprimer avant de les supprimer
          const pointsToRemove = await tx.pointsHistory.findMany({
            where: {
              userId: updatedBoard.userId,
              usedBoardId: boardId,
              type: PointsType.RECYCLING,
            },
            select: { pointsAmount: true },
          });

          const totalPointsToRemove = pointsToRemove.reduce((sum, p) => sum + p.pointsAmount, 0);

          // Supprimer l'historique
          await pointsRepository.deleteInTransaction(tx, updatedBoard.userId, boardId);

          // Déduire les points de l'utilisateur
          if (totalPointsToRemove > 0) {
            await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, -totalPointsToRemove);
          }

          await tx.usedBoard.update({
            where: { id: boardId },
            data: { pointsAwarded: 0 },
          });
        }
        
      } else if (
        updateData.pointsAwarded !== undefined &&
        pointsEligibleStatuses.includes(updatedBoard.status) &&
        updatedBoard.userId
      ) {
        // Mise à jour des points seulement
        const pointsRepository = pointsService.getRepository();
        
        // Récupérer les anciens points
        const oldPointsEntries = await tx.pointsHistory.findMany({
          where: {
            userId: updatedBoard.userId,
            usedBoardId: boardId,
            type: PointsType.RECYCLING,
          },
          select: { pointsAmount: true },
        });

        const oldTotal = oldPointsEntries.reduce((sum, p) => sum + p.pointsAmount, 0);
        
        // Supprimer l'ancien historique
        await pointsRepository.deleteInTransaction(tx, updatedBoard.userId, boardId);

        if (updatedBoard.pointsAwarded && updatedBoard.pointsAwarded > 0) {
          // Créer le nouvel historique
          await pointsRepository.createInTransaction(tx, {
            userId: updatedBoard.userId,
            type: PointsType.RECYCLING,
            pointsAmount: updatedBoard.pointsAwarded,
            usedBoardId: boardId,
          });

          // Ajuster les points utilisateur (différence)
          const difference = updatedBoard.pointsAwarded - oldTotal;
          if (difference !== 0) {
            await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, difference);
          }
        } else {
          // Supprimer tous les points
          if (oldTotal > 0) {
            await pointsRepository.addPointsToUserInTransaction(tx, updatedBoard.userId, -oldTotal);
          }
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
        
        // Récupérer les points à supprimer
        const pointsEntries = await tx.pointsHistory.findMany({
          where: {
            userId: board.user.id,
            usedBoardId: boardId,
            type: PointsType.RECYCLING,
          },
          select: { pointsAmount: true },
        });

        const totalPoints = pointsEntries.reduce((sum, p) => sum + p.pointsAmount, 0);
        
        // Supprimer l'historique
        await pointsRepository.deleteInTransaction(tx, board.user.id, boardId);
        
        // Déduire les points de l'utilisateur
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