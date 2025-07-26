import { prisma } from '@/lib/prisma';
import { NotificationTarget } from '@/generated/prisma';

interface CreateNotificationData {
  userId?: string | null;
  target: NotificationTarget;
  description: string;
}

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: {
      userId: userId,
      target: 'USER',
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getAdminNotifications() {
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

export async function markAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });
}

export async function createNotification(data: CreateNotificationData) {
  try {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        target: data.target,
        description: data.description,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
}

export async function getUnreadCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId: userId,
      target: 'USER',
      isRead: false,
    },
  });
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
