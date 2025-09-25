import { prisma } from '@/lib/prisma';
import { Notification } from '@/generated/prisma';
import {
  InterfaceNotificationRepository,
  CreateNotificationData,
  NotificationWithUser
} from './interface-notifications.repository';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class NotificationRepository implements InterfaceNotificationRepository {
  
  async findAdminNotifications(): Promise<NotificationWithUser[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        target: 'ADMIN',
        deletedAt: null,
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

    return notifications as NotificationWithUser[];
  }

  async findByUserId(userId: string): Promise<NotificationWithUser[]> {
    const notifications = await prisma.notification.findMany({
      where: { 
        userId,
        target: 'USER',
        isRead: false,
        deletedAt: null,
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
      take: 50,
    });

    return notifications as NotificationWithUser[];
  }

  async findById(id: string): Promise<Notification | null> {
    return await prisma.notification.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
    });
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        target: data.target,
        description: data.description,
        isRead: false,
      },
    });
  }


  async createInTransaction(tx: PrismaTransaction, data: CreateNotificationData): Promise<Notification> {
    return await tx.notification.create({
      data: {
        userId: data.userId,
        target: data.target,
        description: data.description,
        isRead: false,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  }


  async deleteAllForUser(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        target: 'USER',
        deletedAt: null,
      },
    });

    return { count: result.count };
  }

  async deleteOldAdminNotifications(daysOld: number = 30): Promise<{ count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        target: 'ADMIN',
        createdAt: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
    });

    return { count: result.count };
  }
}