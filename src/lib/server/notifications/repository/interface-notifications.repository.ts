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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/utils/prisma').prisma.$transaction>[0]>[0];
export interface InterfaceNotificationRepository {
 
  create(data: CreateNotificationData): Promise<Notification>;
  createInTransaction(tx: PrismaTransaction, data: CreateNotificationData): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<NotificationWithUser[]>;
  findAdminNotifications(): Promise<NotificationWithUser[]>;
  delete(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<{ count: number }>;
}