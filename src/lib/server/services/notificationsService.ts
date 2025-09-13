import { prisma } from '@/lib/prisma';
import { NotificationTarget } from '@/generated/prisma';
import { z } from 'zod';

interface CreateNotificationData {
  userId?: string | null;
  target: NotificationTarget;
  description: string;
}

interface NotificationWithUser {
  id: string;
  userId: string | null;
  target: NotificationTarget;
  description: string;
  isRead: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

const notificationIdSchema = z.object({
  notificationId: z.string().min(1, 'ID notification requis'),
});

const userIdSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
});

export class NotificationService {
  async getAdminNotifications(): Promise<NotificationWithUser[]> {
    return await prisma.notification.findMany({
      where: {
        target: 'ADMIN',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createNotification(data: CreateNotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          target: data.target,
          description: data.description,
          isRead: false,
        },
      });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      throw new Error('Erreur lors de la création de la notification');
    }
  }

  async deleteNotification(notificationId: string, userId: string, userRole: string) {
    const validation = notificationIdSchema.safeParse({ notificationId });
    if (!validation.success) {
      throw new Error('ID notification invalide');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    if (notification.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Non autorisé à supprimer cette notification');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return {
      message: 'Notification supprimée avec succès',
    };
  }

  async markNotificationAsRead(notificationId: string, userId: string, userRole: string) {
    const validation = notificationIdSchema.safeParse({ notificationId });
    if (!validation.success) {
      throw new Error('ID notification invalide');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    if (notification.userId !== userId && userRole !== 'ADMIN') {
      throw new Error('Non autorisé à modifier cette notification');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      message: 'Notification marquée comme lue',
    };
  }

  async markAllNotificationsAsRead(targetUserId: string, currentUserId: string, userRole: string) {
    const validation = userIdSchema.safeParse({ userId: targetUserId });
    if (!validation.success) {
      throw new Error('ID utilisateur invalide');
    }

    if (targetUserId !== currentUserId && userRole !== 'ADMIN') {
      throw new Error('Non autorisé à modifier les notifications de cet utilisateur');
    }
    const result = await prisma.notification.updateMany({
      where: {
        userId: targetUserId,
        isRead: false,
        target: 'USER',
      },
      data: { isRead: true },
    });

    return {
      message: `${result.count} notifications marquées comme lues`,
      count: result.count,
    };
  }
}

export const NotificationTemplates = {
  boardSubmitted: (boardName: string) =>
    `Ta planche "${boardName}" a été soumise avec succès ! Elle sera bientôt étudiée par notre équipe.`,
  boardValidated: (boardName: string) =>
    `Ta planche "${boardName}" a été validée par notre équipe.`,
  boardSent: (boardName: string) => `Tu as expédiée ta planche "${boardName}".`,
  boardReceived: (boardName: string, points: number) =>
    `Ta planche "${boardName}" a été reçue ! ${points} points attribués.`,
  boardRejected: (boardName: string) =>
    `Ta planche "${boardName}" a été rejetée`,
  boardRecycled: (boardName: string, productName: string) =>
    `Ta planche "${boardName}" a gagné une seconde vie en tant que "${productName}".`,
  boardSold: (boardName: string, points: number) =>
    `La planche issu de "${boardName}" a été vendu ! Merci pour Ta contribution. ${points} points attribués.`,
  favoriteProductPurchased: (productName: string) =>
    `"${productName}" a été acheté.`,
  newBoardSubmitted: (userName: string, boardName: string) =>
    `Nouvelle planche soumise par ${userName} : "${boardName}"`,
  newUserRegistered: (userName: string) =>
    `Nouvel utilisateur inscrit : ${userName}`,
  orderConfirmed: (orderId: string, totalAmount: number) =>
    `Commande #${orderId} confirmée. Montant: ${totalAmount}€. Merci pour Ton achat.`,
  orderShipped: (orderId: string) => `Commande #${orderId} expédiée.`,
  orderDelivered: (orderId: string) =>
    `Commande #${orderId} livrée. Nous espérons que tu es satisfait`,
  orderCancelled: (orderId: string, reason?: string) =>
    `Commande #${orderId} annulée${reason ? ` : ${reason}` : ''}. Tu seras remboursé sous 2-3 jours après nous avoir retourné la planche.`,
  welcomeUser: (userName: string) =>
    `Bienvenue ${userName} ! Ton compte a été créé avec succès.`,
  profileUpdated: () => `Ton profil a été mis à jour avec succès.`,
  passwordChanged: () => `Ton mot de passe a été modifié avec succès.`,
};

export const notificationService = new NotificationService();

export async function createNotification(data: CreateNotificationData) {
  return await notificationService.createNotification(data);
}

export async function getAdminNotifications() {
  return await notificationService.getAdminNotifications();
}