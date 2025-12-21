import { UsedBoard, UsedBoardStatus, UserRole } from '@/generated/prisma';
import {
  InterfaceUsedBoardRepository,
  CreateUsedBoardData,
  UpdateUsedBoardData,
  UsedBoardWithRelations
} from './repository/interface-used-boards.repository';
import { UsedBoardRepository } from './repository/used-boards.repository';
import { PointsHistoryService } from '../points-history/points-history.service';
import { createNotification, NotificationTemplates } from '../notifications/notifications.service';
import { UserService } from '../users/users-service';
import { PointsCalculatorService } from '../points-calculator/points-calculator';
import { ImageService } from '../upload-images/images.service';
import { PaginatedResponse, PaginationParams, normalizePaginationParams } from '@/lib/utils/pagination';
import { MailService } from '../mail/mail.service';

export class UsedBoardService {
  constructor(
    private usedBoardRepository: InterfaceUsedBoardRepository = new UsedBoardRepository(),
    private imageService: ImageService = new ImageService('usedBoards'),
    private pointsHistoryService: PointsHistoryService = new PointsHistoryService(),
    private userService: UserService = new UserService(),
    private mailService: MailService = new MailService()
  ) {}

  async createUsedBoard(
    data: Omit<CreateUsedBoardData, 'image'>,
    imageFiles: File[]
  ): Promise<UsedBoard> {
    let imageUrls: string[] = [];

    if (imageFiles && imageFiles.length > 0) {
      const imageResult = await this.imageService.uploadMultiple(imageFiles);

      if (!imageResult.success) {
        throw new Error(`Erreur upload images: ${imageResult.errors.join(', ')}`);
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

  async getUsedBoardById(boardId: string): Promise<UsedBoardWithRelations> {
    if (!boardId) {
      throw new Error('ID de planche requis');
    }

    const board = await this.usedBoardRepository.findById(boardId);

    if (!board) {
      throw new Error('Planche d\'occasion non trouvée');
    }

    return board;
  }

  async getAllUsedBoards(): Promise<UsedBoardWithRelations[]> {
    return await this.usedBoardRepository.findAll();
  }

  async getUserUsedBoards(userId: string): Promise<UsedBoardWithRelations[]> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    return await this.usedBoardRepository.findByUserId(userId);
  }

  async getAllUsedBoardsWithPagination(
    params: PaginationParams
  ): Promise<PaginatedResponse<UsedBoardWithRelations>> {
    const { page, limit } = normalizePaginationParams(params);
    return await this.usedBoardRepository.findAllWithPagination(page, limit);
  }

  async getUserUsedBoardsWithPagination(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<UsedBoardWithRelations>> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    const { page, limit } = normalizePaginationParams(params);
    return await this.usedBoardRepository.findByUserIdWithPagination(userId, page, limit);
  }

  async getAvailableUsedBoards(): Promise<UsedBoardWithRelations[]> {
    return await this.usedBoardRepository.findAvailable();
  }

  async updateUsedBoardStatus(
    boardId: string,
    updateData: UpdateUsedBoardData
  ): Promise<UsedBoardWithRelations> {
    if (!boardId) {
      throw new Error('ID de planche requis');
    }

    const oldBoard = await this.getUsedBoardById(boardId);
    const finalUpdateData = { ...updateData };

    if (updateData.status === UsedBoardStatus.RECEIVED && oldBoard.status !== UsedBoardStatus.RECEIVED) {
      const autoPoints = PointsCalculatorService.calculateRecyclingPoints(
        oldBoard.boardType,
        oldBoard.boardCondition || 'AVERAGE'
      );
      finalUpdateData.pointsAwarded = autoPoints;
    }

    const updatedBoard = await this.usedBoardRepository.updateWithPointsAndUserTransaction(
      boardId,
      finalUpdateData,
      oldBoard,
      {
        pointsHistoryService: this.pointsHistoryService,
        userService: this.userService,
      }
    );

    const statusChanged = oldBoard.status !== updatedBoard.status;
    if (statusChanged) {
      await this.createStatusChangeNotification(updatedBoard);
    }

    if (
        updatedBoard.pointsAwarded !== null && 
        oldBoard.pointsAwarded !== null && 
        updatedBoard.pointsAwarded !== oldBoard.pointsAwarded
    ) {
        await this.createPointsChangeNotification(updatedBoard, oldBoard.pointsAwarded);
    }

    return updatedBoard;
  }

  async deleteUsedBoard(boardId: string): Promise<void> {
    if (!boardId) {
      throw new Error('ID de planche requis');
    }

    const board = await this.getUsedBoardById(boardId);

    if (board.image && board.image.length > 0) {
      await this.imageService.deleteMultiple(board.image);
    }

    await this.usedBoardRepository.delete(boardId);
  }

  getRepository(): InterfaceUsedBoardRepository {
    return this.usedBoardRepository;
  }

  private async createBoardSubmissionNotifications(board: UsedBoard): Promise<void> {
    try {
      if (!board.userId) return;

      await createNotification({
        userId: board.userId,
        target: UserRole.USER,
        description: NotificationTemplates.boardSubmitted(board.name),
      });

      const user = await this.userService.getUserById(board.userId);
      if (user) {
        await createNotification({
          userId: null,
          target: UserRole.ADMIN,
          description: NotificationTemplates.newBoardSubmitted(
            user.name || 'Utilisateur',
            board.name
          ),
        });

      if (user && user.email) {
          await this.mailService.sendBoardSubmissionConfirmationEmail(
              user.email,
              board.name,
              board.description,
              board.image,
              user.name || 'Utilisateur'
          );
      }
      }
    } catch (error) {
      console.error('Erreur notifications soumission:', error);
    }
  }

  private async createStatusChangeNotification(board: UsedBoardWithRelations): Promise<void> {
    try {
      if (!board.userId) return;

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
            board.name,
            board.pointsAwarded || 0
          );
          break;
        case UsedBoardStatus.REJECTED:
          notificationDescription = NotificationTemplates.boardRejected(board.name);
          break;
        case UsedBoardStatus.RECYCLED_TO_PRODUCT:
          const productName = board.product?.name || 'nouveau produit';
          notificationDescription = NotificationTemplates.boardRecycled(board.name, productName);
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

  private async createPointsChangeNotification(board: UsedBoardWithRelations, oldPoints: number): Promise<void> {
    try {
        if (!board.userId || board.pointsAwarded === null) return;

        const diff = board.pointsAwarded - oldPoints;
        if (diff === 0) return;

        await createNotification({
            userId: board.userId,
            target: 'USER',
            description: NotificationTemplates.pointsUpdated(board.name, board.pointsAwarded, diff),
        });
    } catch (error) {
        console.error('Erreur notification changement points:', error);
    }
  }
}