import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotificationService } from '../../lib/server/notifications/notifications.service'
import { NotificationTarget } from '@/generated/prisma'


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
      findByUserId: vi.fn(),
      findAdminNotifications: vi.fn(),
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
    it("doit retourner les notifications d'un utilisateur", async () => {
      mockRepository.findByUserId.mockResolvedValue([mockNotificationWithUser])

      const result = await notificationService.getUserNotifications('user-1')

      expect(result).toEqual([mockNotificationWithUser])
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1')
    })

    it("doit retourner une erreur si l'utilisateur n'existe pas ", async () => {
      await expect(notificationService.getUserNotifications(''))
        .rejects.toThrow('ID utilisateur invalide')
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

      const result = await notificationService.deleteNotification('notif-1', 'user-1', 'ADMIN')

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


    it("doit retourner une erreur si un utilisateur tente de supprimer toutes les notifications d'un autre utilisateur", async () => {
      await expect(notificationService.deleteAllUserNotifications('user-2', 'user-1', 'USER'))
        .rejects.toThrow('Non autorisé à supprimer les notifications de cet utilisateur')
    })
  })
})