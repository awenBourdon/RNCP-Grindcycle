import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotificationService } from '../../lib/server/notifications/notifications.service'
import { NotificationTarget, UserRole } from '@/generated/prisma'

vi.mock('../repository/notifications.repository')

describe('NotificationService', () => {
  let notificationService: NotificationService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    target: NotificationTarget.USER,
    description: 'Test notification',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    deletedAt: null,
  }

  const mockNotificationWithUser = {
    ...mockNotification,
    user: {
      id: 'user-1',
      name: 'grind cycle',
      email: 'grind@example.com'
    }
  }

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      createInTransaction: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdWithPagination: vi.fn(),
      findAdminNotifications: vi.fn(),
      findAdminNotificationsWithPagination: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
      deleteAllForUser: vi.fn(),
    }
    
    notificationService = new NotificationService(mockRepository)
    vi.clearAllMocks()
  })

  describe('createNotification', () => {
    it('doit créer une notification', async () => {
      const createData = {
        userId: 'user-1',
        target: NotificationTarget.USER,
        description: 'Test notification'
      }
      mockRepository.create.mockResolvedValue(mockNotification)

      const result = await notificationService.createNotification(createData)

      expect(mockRepository.create).toHaveBeenCalledWith(createData)
      expect(result).toEqual(mockNotification)
    })

    it('doit retourner une erreur', async () => {
      const createData = {
        userId: 'user-1',
        target: NotificationTarget.USER,
        description: 'Test notification'
      }
      mockRepository.create.mockRejectedValue(new Error('Database error'))

      await expect(notificationService.createNotification(createData))
        .rejects.toThrow('Erreur lors de la création de la notification')
    })
  })

  describe('getUserNotifications', () => {
    it("doit retourner les notifications d'un utilisateur sans pagination", async () => {
      mockRepository.findByUserId.mockResolvedValue([mockNotificationWithUser])

      const result = await notificationService.getUserNotifications('user-1')

      expect(result).toEqual([mockNotificationWithUser])
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1')
    })

    it("doit retourner une erreur si l'utilisateur n'existe pas", async () => {
      await expect(notificationService.getUserNotifications(''))
        .rejects.toThrow('ID utilisateur invalide')
    })
  })

  describe('getUserNotificationsWithPagination', () => {
    it("doit retourner les notifications d'un utilisateur avec pagination", async () => {
      const mockPaginatedResponse = {
        data: [mockNotificationWithUser],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }

      mockRepository.findByUserIdWithPagination.mockResolvedValue(mockPaginatedResponse)

      const result = await notificationService.getUserNotificationsWithPagination('user-1', { page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockRepository.findByUserIdWithPagination).toHaveBeenCalledWith('user-1', 1, 20)
    })

    it("doit retourner selon les paramètres de pagination", async () => {
      const mockPaginatedResponse = {
        data: [mockNotificationWithUser],
        meta: {
          currentPage: 2,
          totalPages: 3,
          totalItems: 50,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: true,
        }
      }

      mockRepository.findByUserIdWithPagination.mockResolvedValue(mockPaginatedResponse)

      const result = await notificationService.getUserNotificationsWithPagination('user-1', { page: 2, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockRepository.findByUserIdWithPagination).toHaveBeenCalledWith('user-1', 2, 20)
    })

    it("doit retourner une erreur si l'ID utilisateur est invalide", async () => {
      await expect(notificationService.getUserNotificationsWithPagination('', { page: 1, limit: 20 }))
        .rejects.toThrow('ID utilisateur invalide')
    })
  })

  describe('getAdminNotifications', () => {
    it("doit retourner les notifications admin sans pagination", async () => {
      const mockAdminNotifications = [
        { ...mockNotificationWithUser, target: NotificationTarget.ADMIN }
      ]
      mockRepository.findAdminNotifications.mockResolvedValue(mockAdminNotifications)

      const result = await notificationService.getAdminNotifications()

      expect(result).toEqual(mockAdminNotifications)
      expect(mockRepository.findAdminNotifications).toHaveBeenCalled()
    })
  })

  describe('getAdminNotificationsWithPagination', () => {
    it("doit retourner les notifications admin avec pagination", async () => {
      const mockPaginatedResponse = {
        data: [{ ...mockNotificationWithUser, target: NotificationTarget.ADMIN }],
        meta: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: false,
        }
      }

      mockRepository.findAdminNotificationsWithPagination.mockResolvedValue(mockPaginatedResponse)

      const result = await notificationService.getAdminNotificationsWithPagination({ page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockRepository.findAdminNotificationsWithPagination).toHaveBeenCalledWith(1, 20)
    })

    it("doit gérer la pagination sur plusieurs pages", async () => {
      const mockPaginatedResponse = {
        data: [{ ...mockNotificationWithUser, target: NotificationTarget.ADMIN }],
        meta: {
          currentPage: 3,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: true,
        }
      }

      mockRepository.findAdminNotificationsWithPagination.mockResolvedValue(mockPaginatedResponse)

      const result = await notificationService.getAdminNotificationsWithPagination({ page: 3, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockRepository.findAdminNotificationsWithPagination).toHaveBeenCalledWith(3, 20)
    })
  })

  describe('deleteNotification', () => {
    it("doit supprimer une notification", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification)
      mockRepository.delete.mockResolvedValue(undefined)

      const result = await notificationService.deleteNotification('notif-1', 'user-1', 'USER')

      expect(result.message).toBe('Notification supprimée avec succès')
      expect(mockRepository.delete).toHaveBeenCalledWith('notif-1')
    })

    it('doit permettre à un admin de supprimer une notification', async () => {
      const otherUserNotification = { ...mockNotification, userId: 'user-2' }
      mockRepository.findById.mockResolvedValue(otherUserNotification)
      mockRepository.delete.mockResolvedValue(undefined)

      const result = await notificationService.deleteNotification('notif-1', 'user-1', UserRole.ADMIN)

      expect(result.message).toBe('Notification supprimée avec succès')
    })

    it("doit retourner une erreur si un utilisateur tente de supprimer la notification d'un autre utilisateur", async () => {
      const otherUserNotification = { ...mockNotification, userId: 'user-2' }
      mockRepository.findById.mockResolvedValue(otherUserNotification)

      await expect(notificationService.deleteNotification('notif-1', 'user-1', 'USER'))
        .rejects.toThrow('Non autorisé à supprimer cette notification')
    })

    it("doit retourner une erreur si l'id de la notification est null", async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(notificationService.deleteNotification('notif-1', 'user-1', 'USER'))
        .rejects.toThrow('Notification non trouvée')
    })

    it("doit retourner une erreur si l'id de la notification est vide", async () => {
      await expect(notificationService.deleteNotification('', 'user-1', 'USER'))
        .rejects.toThrow('ID notification invalide')
    })
  })

  describe('deleteAllUserNotifications', () => {
    it('doit permettre à un utilisateur de supprimer toutes ses notifications', async () => {
      mockRepository.deleteAllForUser.mockResolvedValue({ count: 5 })

      const result = await notificationService.deleteAllUserNotifications('user-1', 'user-1', 'USER')

      expect(result.message).toBe('5 notification(s) supprimée(s) avec succès')
      expect(result.count).toBe(5)
      expect(mockRepository.deleteAllForUser).toHaveBeenCalledWith('user-1')
    })

    it('doit permettre à un admin de supprimer toutes les notifications d\'un utilisateur', async () => {
      mockRepository.deleteAllForUser.mockResolvedValue({ count: 3 })

      const result = await notificationService.deleteAllUserNotifications('user-2', 'user-1', UserRole.ADMIN)

      expect(result.message).toBe('3 notification(s) supprimée(s) avec succès')
      expect(result.count).toBe(3)
      expect(mockRepository.deleteAllForUser).toHaveBeenCalledWith('user-2')
    })

    it("doit retourner une erreur si un utilisateur tente de supprimer toutes les notifications d'un autre utilisateur", async () => {
      await expect(notificationService.deleteAllUserNotifications('user-2', 'user-1', 'USER'))
        .rejects.toThrow('Non autorisé à supprimer les notifications de cet utilisateur')
    })

    it("doit retourner une erreur si l'ID utilisateur est vide", async () => {
      await expect(notificationService.deleteAllUserNotifications('', 'user-1', 'USER'))
        .rejects.toThrow('ID utilisateur invalide')
    })
  })
})