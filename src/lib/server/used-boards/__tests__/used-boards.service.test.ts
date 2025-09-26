/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UsedBoardService } from '../used-boards.service'
import { InterfaceUsedBoardRepository } from '../repository/interface-used-boards.repository'
import { ImageService } from '../../upload-images/images.service'
import { PointsHistoryService } from '../../points-history/points-history.service'
import { UserService } from '../../users/users-service'
import { InterfacePointsHistoryRepository } from '../../points-history/repository/interface-points-history.repository'
import { InterfaceUserRepository } from '../../users/repository/interface-users.repository'
import { UsedBoardStatus } from '@/generated/prisma'
import { mockUsedBoard, mockValidatedBoard, mockReceivedBoard, mockCreateUsedBoardData } from './used-boards.mock'

vi.mock('../repository/used-boards.repository')
vi.mock('../../upload-images/images.service')
vi.mock('../../points-history/points-history.service')
vi.mock('../../users/users-service')
vi.mock('../../notifications/notifications.service')

describe('UsedBoardService', () => {
  let usedBoardService: UsedBoardService
  let mockUsedBoardRepository: InterfaceUsedBoardRepository
  let mockImageService: ImageService
  let mockPointsHistoryService: PointsHistoryService
  let mockUserService: UserService

  let mockPointsHistoryRepository: InterfacePointsHistoryRepository
  let mockUserRepository: InterfaceUserRepository

  beforeEach(() => {
    mockPointsHistoryRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      createInTransaction: vi.fn(),
    }

    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      update: vi.fn(),
      updatePoints: vi.fn(),
      updatePointsInTransaction: vi.fn(),
      deleteWithRelationsCleanup: vi.fn(),
    }

    mockUsedBoardRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      findAvailable: vi.fn(),
      update: vi.fn(),
      updateWithPointsAndUserTransaction: vi.fn(),
      delete: vi.fn(),
      findUserById: vi.fn(),
    }

    mockImageService = {
        uploadMultiple: vi.fn(),
        uploadSingle: vi.fn(),
        deleteMultiple: vi.fn(),
        deleteSingle: vi.fn(),
        validate: vi.fn(),
    } as unknown as ImageService

    mockPointsHistoryService = {
        getUserPointsHistory: vi.fn(),
        getRepository: () => mockPointsHistoryRepository,
    } as unknown as PointsHistoryService

    mockUserService = {
        getAllUsers: vi.fn(),
        getUserById: vi.fn(),
        getUserByEmail: vi.fn(),
        updateUserProfile: vi.fn(),
        updateUserPoints: vi.fn(),
        getUserPoints: vi.fn(),
        deleteUser: vi.fn(),
        getRepository: () => mockUserRepository,
    } as unknown as UserService
    
    usedBoardService = new UsedBoardService(
      mockUsedBoardRepository,
      mockImageService,
      mockPointsHistoryService,
      mockUserService
    )
    vi.clearAllMocks()
  })

  describe('createUsedBoard', () => {
    it('doit créer une planche usagée avec images', async () => {
      const mockFiles = [new File([''], 'test.jpg')] as File[]
      vi.mocked(mockImageService.uploadMultiple).mockResolvedValue({
        success: true,
        urls: ['uploaded.jpg'],
        errors: [],
        warnings: []
      })

      vi.mocked(mockUsedBoardRepository.create).mockResolvedValue(mockUsedBoard as any)
      vi.mocked(mockUsedBoardRepository.findUserById).mockResolvedValue({ name: 'John Doe' })

      const result = await usedBoardService.createUsedBoard(mockCreateUsedBoardData, mockFiles)

      expect(result).toEqual(mockUsedBoard)
      expect(mockImageService.uploadMultiple).toHaveBeenCalledWith(mockFiles)
    })

    it('doit nettoyer les images si la création échoue', async () => {

      const mockFiles = [new File([''], 'test.jpg')] as File[]
      vi.mocked(mockImageService.uploadMultiple).mockResolvedValue({
        success: true,
        urls: ['uploaded.jpg'],
        errors: [],
        warnings: []
      })
      vi.mocked(mockUsedBoardRepository.create).mockRejectedValue(new Error('Erreur DB'))
      vi.mocked(mockImageService.deleteMultiple).mockResolvedValue({ deleted: [], failed: [] })

      await expect(usedBoardService.createUsedBoard(mockCreateUsedBoardData, mockFiles))
        .rejects.toThrow('Erreur DB')

      expect(mockImageService.deleteMultiple).toHaveBeenCalledWith(['uploaded.jpg'])
    })
  })

  describe('getUsedBoardById', () => {
    it('doit retourner une planche usagée par son ID', async () => {

      vi.mocked(mockUsedBoardRepository.findById).mockResolvedValue(mockUsedBoard)

      const result = await usedBoardService.getUsedBoardById('board-1')

      expect(result).toEqual(mockUsedBoard)
      expect(mockUsedBoardRepository.findById).toHaveBeenCalledWith('board-1')
    })

    it("doit lever une erreur si la planche usagée n'existe pas", async () => {

      vi.mocked(mockUsedBoardRepository.findById).mockResolvedValue(null)

      await expect(usedBoardService.getUsedBoardById('board-inexistant'))
        .rejects.toThrow('Planche d\'occasion non trouvée')
    })

    it("doit lever une erreur si l'ID est vide", async () => {

      await expect(usedBoardService.getUsedBoardById(''))
        .rejects.toThrow('ID de planche requis')
    })
  })

  describe('updateUsedBoardStatus', () => {
    it('doit mettre à jour le statut vers VALIDATED', async () => {

      vi.mocked(mockUsedBoardRepository.findById).mockResolvedValue(mockUsedBoard)
      vi.mocked(mockUsedBoardRepository.updateWithPointsAndUserTransaction).mockResolvedValue(mockValidatedBoard)

      const result = await usedBoardService.updateUsedBoardStatus('board-1', { status: UsedBoardStatus.VALIDATED })

      expect(result).toEqual(mockValidatedBoard)
      expect(mockUsedBoardRepository.updateWithPointsAndUserTransaction).toHaveBeenCalledWith(
        'board-1',
        { status: UsedBoardStatus.VALIDATED },
        mockUsedBoard,
        {
          pointsHistoryService: mockPointsHistoryService,
          userService: mockUserService,
        }
      )
    })

    it('doit mettre à jour le statut vers RECEIVED et calculer les points', async () => {

      vi.mocked(mockUsedBoardRepository.findById).mockResolvedValue(mockUsedBoard)
      vi.mocked(mockUsedBoardRepository.updateWithPointsAndUserTransaction).mockResolvedValue(mockReceivedBoard)

      const result = await usedBoardService.updateUsedBoardStatus('board-1', { status: UsedBoardStatus.RECEIVED })

      expect(result).toEqual(mockReceivedBoard)
      expect(mockUsedBoardRepository.updateWithPointsAndUserTransaction).toHaveBeenCalledWith(
        'board-1',
        expect.objectContaining({
          status: UsedBoardStatus.RECEIVED,
          pointsAwarded: 80
        }),
        mockUsedBoard,
        expect.any(Object)
      )
    })
  })

  describe('deleteUsedBoard', () => {
    it('doit supprimer une planche usagée et ses images', async () => {

      vi.mocked(mockUsedBoardRepository.findById).mockResolvedValue(mockUsedBoard)
      vi.mocked(mockImageService.deleteMultiple).mockResolvedValue({ deleted: ['board1.jpg'], failed: [] })
      vi.mocked(mockUsedBoardRepository.delete).mockResolvedValue(undefined)

      await usedBoardService.deleteUsedBoard('board-1')

      expect(mockImageService.deleteMultiple).toHaveBeenCalledWith(['board1.jpg'])
      expect(mockUsedBoardRepository.delete).toHaveBeenCalledWith('board-1')
    })
  })

  describe('getUserUsedBoards', () => {
    it("doit retourner les planches usagées d'un utilisateur", async () => {

      vi.mocked(mockUsedBoardRepository.findByUserId).mockResolvedValue([mockUsedBoard])

      const result = await usedBoardService.getUserUsedBoards('user-1')

      expect(result).toEqual([mockUsedBoard])
      expect(mockUsedBoardRepository.findByUserId).toHaveBeenCalledWith('user-1')
    })

    it("doit lever une erreur si l'ID utilisateur est vide", async () => {

      await expect(usedBoardService.getUserUsedBoards(''))
        .rejects.toThrow('ID utilisateur requis')
    })
  })

  describe('getAvailableUsedBoards', () => {
    it('doit retourner les planches usagées disponibles', async () => {

      vi.mocked(mockUsedBoardRepository.findAvailable).mockResolvedValue([mockReceivedBoard])

      const result = await usedBoardService.getAvailableUsedBoards()

      expect(result).toEqual([mockReceivedBoard])
      expect(mockUsedBoardRepository.findAvailable).toHaveBeenCalled()
    })
  })
})