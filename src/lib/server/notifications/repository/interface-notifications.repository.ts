import { Notification, NotificationTarget } from '@/generated/prisma';
import { PaginatedResponse } from '@/lib/utils/pagination';

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
  findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<PaginatedResponse<NotificationWithUser>>;
  findAdminNotificationsWithPagination(page: number, limit: number): Promise<PaginatedResponse<NotificationWithUser>>;
  delete(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<{ count: number }>;
}