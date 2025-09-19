import { UsedBoard, UsedBoardStatus } from '@/generated/prisma';
import {
  CreateUsedBoardData,
  UpdateUsedBoardData,
  UsedBoardWithRelations,
} from '@/lib/server/types/usedBoard';
import { ImageService } from '@/lib/server/src/upload-images/images.service';
import { InterfaceUsedBoardRepository } from './repository/interface-used-boards.repository';
import { UsedBoardRepository } from './repository/used-boards.repository';
import { createNotification, NotificationTemplates } from '../notifications/notifications.service';
import { pointsService } from '../points/points.service';

export class UsedBoardService {
  constructor(
    private usedBoardRepository: InterfaceUsedBoardRepository = new UsedBoardRepository(),
    private imageService: ImageService = new ImageService('usedBoards')
  ) {}

  async createUsedBoard(
    data: Omit<CreateUsedBoardData, 'image'>,
    imageFiles?: File[]
  ): Promise<UsedBoard> {
    let imageUrls: string[] = [];

    if (imageFiles && imageFiles.length > 0) {
      const imageResult = await this.imageService.uploadMultiple(imageFiles);

      if (!imageResult.success) {
        throw new Error(
          `Erreur upload images: ${imageResult.errors.join(', ')}`
        );
      }

      imageUrls = imageResult.urls;
    }

    const usedBoardData: CreateUsedBoardData = {
      ...data,
      image: imageUrls,
    };

    try {
      const board = await this.usedBoardRepository.create(usedBoardData);
      await this.createBoardSubmissionNotifications(board);
      return board;
    } catch (error) {
      if (imageUrls.length > 0) {
        await this.imageService.deleteMultiple(imageUrls);
      }
      throw error;
    }
  }

  async getUsedBoardById(id: string): Promise<UsedBoardWithRelations> {
    const usedBoard = await this.usedBoardRepository.findById(id);

    if (!usedBoard) {
      throw new Error("Planche d'occasion non trouvée");
    }

    return usedBoard;
  }

  async getAllUsedBoards(): Promise<UsedBoardWithRelations[]> {
    return await this.usedBoardRepository.findAll();
  }

  async getUserUsedBoards(userId: string): Promise<UsedBoardWithRelations[]> {
    return await this.usedBoardRepository.findByUserId(userId);
  }

  async getAvailableUsedBoards(): Promise<UsedBoardWithRelations[]> {
    const availableStatuses: UsedBoardStatus[] = [
      UsedBoardStatus.RECEIVED,
    ];
    return await this.usedBoardRepository.findAll({
      status: availableStatuses,
    });
  }

  async updateUsedBoard(
    boardId: string,
    updateData: Partial<UpdateUsedBoardData>
  ): Promise<UsedBoardWithRelations> {
    const oldBoard = await this.getUsedBoardById(boardId);
    
    const updatedBoard = await this.usedBoardRepository.updateWithPointsTransaction(
      boardId,
      updateData,
      oldBoard
    );

    const statusChanged = oldBoard.status !== updatedBoard.status;
    if (statusChanged) {
      await this.createStatusChangeNotification(updatedBoard);
    }

    return updatedBoard;
  }

  async deleteUsedBoard(boardId: string): Promise<void> {
    const board = await this.getUsedBoardById(boardId);

    await this.usedBoardRepository.deleteWithPointsTransaction(boardId, board);

    if (board.image && board.image.length > 0) {
      await this.imageService.deleteMultiple(board.image);
    }
  }

  async awardPointsToBoard(userId: string, boardId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new Error('Le montant des points doit être positif');
    }

    await pointsService.awardRecyclingPoints(userId, boardId, amount);
  }

  async removePointsFromBoard(userId: string, boardId: string): Promise<void> {
    await pointsService.removePointsForUsedBoard(userId, boardId);
  }

  private async createBoardSubmissionNotifications(
    board: UsedBoard
  ): Promise<void> {
    try {
      if (!board.userId) {
        return;
      }

      await createNotification({
        userId: board.userId,
        target: 'USER',
        description: NotificationTemplates.boardSubmitted(board.name),
      });

      const user = await this.usedBoardRepository.findUserById(board.userId);
      if (user) {
        await createNotification({
          userId: null,
          target: 'ADMIN',
          description: NotificationTemplates.newBoardSubmitted(
            user.name || 'Utilisateur',
            board.name
          ),
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création des notifications de soumission:', error);
    }
  }

  private async createStatusChangeNotification(
    board: UsedBoardWithRelations
  ): Promise<void> {
    try {
      if (!board.userId) {
        return;
      }

      let notificationDescription = '';

      switch (board.status) {
        case UsedBoardStatus.VALIDATED:
          notificationDescription = NotificationTemplates.boardValidated(board.name);
          break;

        case UsedBoardStatus.SENT:
          notificationDescription = NotificationTemplates.boardSent(board.name);
          break;

        case UsedBoardStatus.RECEIVED:
          notificationDescription = NotificationTemplates.boardReceived(
            board.name
          );
          break;

        case UsedBoardStatus.REJECTED:
          notificationDescription = NotificationTemplates.boardRejected(board.name);
          break;

        case UsedBoardStatus.RECYCLED_TO_PRODUCT:
          const productName = board.product?.name || 'nouveau produit';
          notificationDescription = NotificationTemplates.boardRecycled(
            board.name,
            productName
          );
          break;

        case UsedBoardStatus.SOLD:
          notificationDescription = NotificationTemplates.boardSold(
            board.name,
            board.pointsAwarded || 0
          );
          break;

        default:
          return;
      }

      if (notificationDescription) {
        await createNotification({
          userId: board.userId,
          target: 'USER',
          description: notificationDescription,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création des notifications de changement de statut:', error);
    }
  }
}