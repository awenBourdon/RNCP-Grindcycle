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

export class UsedBoardService {
  constructor(
    private usedBoardRepository: InterfaceUsedBoardRepository = new UsedBoardRepository(),
    private imageService: ImageService = new ImageService('usedBoards')
  ) {}

  async createUsedBoard(
    data: Omit<CreateUsedBoardData, 'image'>,
    imageFiles?: File[]
  ): Promise<UsedBoard> {
    let imageurls: string[] = [];

    if (imageFiles && imageFiles.length > 0) {
      const imageResult = await this.imageService.uploadMultiple(imageFiles);

      if (!imageResult.success) {
        throw new Error(
          `Erreur upload images: ${imageResult.errors.join(', ')}`
        );
      }

      imageurls = imageResult.urls;
    }

    const usedBoardData: CreateUsedBoardData = {
      ...data,
      image: imageurls,
    };

    try {
      const board = await this.usedBoardRepository.create(usedBoardData);
      await this.createBoardSubmissionNotifications(board);
      return board;
    } catch (error) {
      if (imageurls.length > 0) {
        await this.imageService.deleteMultiple(imageurls);
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
      console.error('Erreur lors de la création des notifications:', error);
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
        case 'VALIDATED':
          notificationDescription = NotificationTemplates.boardValidated(
            board.name
          );
          break;

        case 'SENT':
          notificationDescription = NotificationTemplates.boardSent(board.name);
          break;

        case 'RECEIVED':
          notificationDescription = NotificationTemplates.boardReceived(
            board.name,
            board.pointsAwarded || 0
          );
          break;

        case 'REJECTED':
          notificationDescription = NotificationTemplates.boardRejected(
            board.name
          );
          break;

        case 'RECYCLED_TO_PRODUCT':
          if (board.product) {
            notificationDescription = NotificationTemplates.boardRecycled(
              board.name,
              board.product.name
            );
          } else {
            notificationDescription = NotificationTemplates.boardRecycled(
              board.name,
              'nouveau produit'
            );
          }
          break;

        case 'SOLD':
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
      console.error('Erreur notification changement statut:', error);
    }
  }
}