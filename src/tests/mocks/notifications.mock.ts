import { NotificationTarget } from '@/generated/prisma'

export const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  target: NotificationTarget.USER,
  description: 'Test notification',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
}

export const mockNotificationWithUser = {
  ...mockNotification,
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com'
  }
}

export const mockAdminNotification = {
  id: 'notif-admin-1',
  userId: null,
  target: NotificationTarget.ADMIN,
  description: 'Admin notification',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
  user: null
}