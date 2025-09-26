import { prisma } from '@/lib/utils/prisma';
import { UsedBoard, UsedBoardStatus, PointsType } from '@/generated/prisma';
import {
  InterfaceUsedBoardRepository,
  CreateUsedBoardData,
  UpdateUsedBoardData,
  UsedBoardWithRelations
} from './interface-used-boards.repository';
import { UserService } from '../../users/users-service';
import { PointsHistoryService } from '../../points-history/points-history.service';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class UsedBoardRepository implements InterfaceUsedBoardRepository {

  async create(data: CreateUsedBoardData): Promise<UsedBoard> {
    return await prisma.usedBoard.create({
      data: {
        userId: data.userId,
        name: data.name,
        boardType: data.boardType,
        boardCondition: data.boardCondition,
        description: data.description,
        image: data.image,
        status: UsedBoardStatus.PENDING_VALIDATION,
        pointsAwarded: 0,
      },
    });
  }

  async findById(id: string): Promise<UsedBoardWithRelations | null> {
    const board = await prisma.usedBoard.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
      include: this.getIncludeRelations(),
    });

    return board as UsedBoardWithRelations | null;
  }


  async findAll(): Promise<UsedBoardWithRelations[]> {
    const boards = await prisma.usedBoard.findMany({
      where: { deletedAt: null },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return boards as UsedBoardWithRelations[];
  }

  async findByUserId(userId: string): Promise<UsedBoardWithRelations[]> {
    const boards = await prisma.usedBoard.findMany({
      where: { 
        userId,
        deletedAt: null 
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return boards as UsedBoardWithRelations[];
  }

  async findAvailable(): Promise<UsedBoardWithRelations[]> {
    const boards = await prisma.usedBoard.findMany({
      where: { 
        deletedAt: null,
        status: UsedBoardStatus.RECEIVED
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return boards as UsedBoardWithRelations[];
  }

  async update(id: string, data: UpdateUsedBoardData): Promise<UsedBoardWithRelations> {
    const board = await prisma.usedBoard.update({
      where: { id },
      data: {
        name: data.name,
        boardType: data.boardType,
        boardCondition: data.boardCondition,
        description: data.description,
        image: data.image,
        status: data.status,
        pointsAwarded: data.pointsAwarded,
      },
      include: this.getIncludeRelations(),
    });

    return board as UsedBoardWithRelations;
  }

  async updateWithPointsInTransaction(
    tx: PrismaTransaction,
    id: string,
    data: UpdateUsedBoardData
  ): Promise<UsedBoardWithRelations> {
    const board = await tx.usedBoard.update({
      where: { id },
      data: {
        name: data.name,
        boardType: data.boardType,
        boardCondition: data.boardCondition,
        description: data.description,
        image: data.image,
        status: data.status,
        pointsAwarded: data.pointsAwarded,
      },
      include: this.getIncludeRelations(),
    });

    return board as UsedBoardWithRelations;
  }

  async updateWithPointsAndUserTransaction(
    id: string,
    data: UpdateUsedBoardData,
    oldBoard: UsedBoardWithRelations,
    services: {
      pointsHistoryService: PointsHistoryService;
      userService: UserService;
    }
  ): Promise<UsedBoardWithRelations> {
    return await prisma.$transaction(async (tx) => {
      const updatedBoard = await this.updateWithPointsInTransaction(tx, id, data);

      if (updatedBoard.userId) {
        await this.handlePointsUpdate(tx, updatedBoard, oldBoard, services);
      }

      return updatedBoard;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.usedBoard.delete({
      where: { id },
    });
  }

  async findUserById(userId: string): Promise<{ name: string | null } | null> {
    return await prisma.user.findUnique({
      where: { 
        id: userId,
        deletedAt: null 
      },
      select: { name: true },
    });
  }

  private async handlePointsUpdate(
    tx: PrismaTransaction,
    updatedBoard: UsedBoardWithRelations,
    oldBoard: UsedBoardWithRelations,
    services: {
      pointsHistoryService: PointsHistoryService;
      userService: UserService;
    }
  ): Promise<void> {
    const statusChanged = oldBoard.status !== updatedBoard.status;
    const pointsChanged = oldBoard.pointsAwarded !== updatedBoard.pointsAwarded;

    if (statusChanged && updatedBoard.status === UsedBoardStatus.RECEIVED) {
      const pointsToAward = updatedBoard.pointsAwarded || 0;
      
      if (pointsToAward > 0) {
        await services.pointsHistoryService.getRepository().createInTransaction(tx, {
          userId: updatedBoard.userId!,
          type: PointsType.RECYCLING,
          pointsAmount: pointsToAward,
          usedBoardId: updatedBoard.id,
        });

        await services.userService.getRepository().updatePointsInTransaction(
          tx,
          updatedBoard.userId!,
          pointsToAward
        );
      }
    } else if (pointsChanged && updatedBoard.status === UsedBoardStatus.RECEIVED) {
      const oldPoints = oldBoard.pointsAwarded || 0;
      const newPoints = updatedBoard.pointsAwarded || 0;
      const pointsDifference = newPoints - oldPoints;

      if (pointsDifference !== 0) {
        await services.pointsHistoryService.getRepository().createInTransaction(tx, {
          userId: updatedBoard.userId!,
          type: PointsType.ADJUSTMENT_RECYCLING,
          pointsAmount: pointsDifference,
          usedBoardId: updatedBoard.id,
        });


        await services.userService.getRepository().updatePointsInTransaction(
          tx,
          updatedBoard.userId!,
          pointsDifference
        );
      }
    }
  }

 private getIncludeRelations() {
    return {
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
    };
  }
}