import { z } from 'zod';
import { CreateNotificationData, InterfaceNotificationRepository, NotificationWithUser } from './repository/interface-notifications.repository';
import { NotificationRepository } from './repository/notifications.repository';
import { PaginatedResponse, PaginationParams, normalizePaginationParams } from '@/lib/utils/pagination';

const notificationIdSchema = z.object({
  notificationId: z.string().min(1, 'ID notification requis'),
});

const userIdSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
});

export class NotificationService {
  constructor(
    private notificationRepository: InterfaceNotificationRepository = new NotificationRepository()
  ) {}

  async getAdminNotifications(): Promise<NotificationWithUser[]> {
    return await this.notificationRepository.findAdminNotifications();
  }

  async getUserNotifications(userId: string): Promise<NotificationWithUser[]> {
    const validation = userIdSchema.safeParse({ userId });
    if (!validation.success) {
      throw new Error('ID utilisateur invalide');
    }

    return await this.notificationRepository.findByUserId(userId);
  }

  async getAdminNotificationsWithPagination(
    params: PaginationParams
  ): Promise<PaginatedResponse<NotificationWithUser>> {
    const { page, limit } = normalizePaginationParams(params);
    return await this.notificationRepository.findAdminNotificationsWithPagination(page, limit);
  }

  async getUserNotificationsWithPagination(
    userId: string, 
    params: PaginationParams
  ): Promise<PaginatedResponse<NotificationWithUser>> {
    const validation = userIdSchema.safeParse({ userId });
    if (!validation.success) {
      throw new Error('ID utilisateur invalide');
    }

    const { page, limit } = normalizePaginationParams(params);
    return await this.notificationRepository.findByUserIdWithPagination(userId, page, limit);
  }

  async createNotification(data: CreateNotificationData) {
    try {
      return await this.notificationRepository.create(data);
    } catch (err) {
      console.error('[NotificationService] Erreur création notification:', err instanceof Error ? err.message : err);
      throw new Error('Erreur lors de la création de la notification');
    }
  }

  async deleteNotification(notificationId: string, userId: string, userRole: string) {
    const validation = notificationIdSchema.safeParse({ notificationId });
    if (!validation.success) {
      throw new Error('ID notification invalide');
    }

    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    if (notification.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Non autorisé à supprimer cette notification');
    }

    await this.notificationRepository.delete(notificationId);

    return {
      message: 'Notification supprimée avec succès',
    };
  }

  async deleteAllUserNotifications(targetUserId: string, currentUserId: string, userRole: string) {
    const validation = userIdSchema.safeParse({ userId: targetUserId });
    if (!validation.success) {
      throw new Error('ID utilisateur invalide');
    }

    if (targetUserId !== currentUserId && userRole !== 'ADMIN') {
      throw new Error('Non autorisé à supprimer les notifications de cet utilisateur');
    }

    const result = await this.notificationRepository.deleteAllForUser(targetUserId);

    return {
      message: `${result.count} notification(s) supprimée(s) avec succès`,
      count: result.count,
    };
  }
}

export const NotificationTemplates = {
  boardSubmitted: (boardName: string) =>
    `Ta planche "${boardName}" a été soumise avec succès ! Elle sera bientôt étudiée par notre équipe.`,
  boardValidated: (boardName: string) =>
    `Ta planche "${boardName}" a été validée par notre équipe.`,
  boardSent: (boardName: string) => 
    `Tu as expédié ta planche "${boardName}".`,
  boardReceived: (boardName: string, points: number) =>
    `Ta planche "${boardName}" a été reçue ! ${points} points attribués.`,
  boardRejected: (boardName: string) =>
    `Ta planche "${boardName}" a été rejetée`,
  boardRecycled: (boardName: string, productName: string) =>
    `Ta planche "${boardName}" a gagné une seconde vie en tant que "${productName}".`,
  
  favoriteProductPurchased: (productName: string) =>
    `"${productName}" a été acheté.`,
  newBoardSubmitted: (userName: string, boardName: string) =>
    `Nouvelle planche soumise par ${userName} : "${boardName}"`,
  newUserRegistered: (userName: string) =>
    `Nouvel utilisateur inscrit : ${userName}`,
  orderConfirmed: (orderId: string, pointsUsed: number) =>
    `Commande #${orderId} confirmée avec ${pointsUsed} points. Merci pour ton achat.`,
  orderShipped: (orderId: string) => 
    `Commande #${orderId} expédiée.`,
  orderDelivered: (orderId: string) =>
    `Commande #${orderId} livrée. Nous espérons que tu es satisfait`,
  orderCancelled: (orderId: string, reason?: string) =>
    `Commande #${orderId} annulée${reason ? ` : ${reason}` : ''}. Tu seras remboursé sous 2-3 jours.`,
  welcomeUser: (userName: string) =>
    `Bienvenue ${userName} ! Ton compte a été créé avec succès.`,
  profileUpdated: () => 
    `Ton profil a été mis à jour avec succès.`,
  passwordChanged: () => 
    `Ton mot de passe a été modifié avec succès.`,
};

export const notificationService = new NotificationService();

export async function createNotification(data: CreateNotificationData) {
  return await notificationService.createNotification(data);
}