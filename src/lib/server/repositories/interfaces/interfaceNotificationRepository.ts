import { Notification, NotificationTarget } from '@/generated/prisma';

export interface CreateNotificationData {
  userId?: string | null;
  target: NotificationTarget;
  description: string;
}

export interface NotificationWithUser {
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

export interface InterfaceNotificationRepository {
  findAdminNotifications(): Promise<NotificationWithUser[]>;
  findByUserId(userId: string): Promise<NotificationWithUser[]>;
  findById(id: string): Promise<Notification | null>;
  create(data: CreateNotificationData): Promise<Notification>;
  delete(id: string): Promise<void>;
  markAsRead(id: string): Promise<void>;
  markAllAsReadForUser(userId: string): Promise<{ count: number }>;
}