import { prisma } from '@/lib/prisma';
import { Notification } from '@/generated/prisma';
import { CreateNotificationData, InterfaceNotificationRepository, NotificationWithUser } from './interface-notifications.repository';

export class NotificationRepository implements InterfaceNotificationRepository {
  
  async findAdminNotifications(): Promise<NotificationWithUser[]> {
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

  async findByUserId(userId: string): Promise<NotificationWithUser[]> {
    return await prisma.notification.findMany({
      where: { 
        userId,
        target: 'USER' ,
        isRead: false
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
  }

  async findById(id: string): Promise<Notification | null> {
    return await prisma.notification.findUnique({
      where: { id },
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

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsReadForUser(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        target: 'USER',
      },
      data: { isRead: true },
    });

    return { count: result.count };
  }
}