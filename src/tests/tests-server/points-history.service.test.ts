import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PointsHistoryService } from '../../lib/server/points-history/points-history.service'
import { InterfacePointsHistoryRepository } from '../../lib/server/points-history/repository/interface-points-history.repository'
import { mockPointsHistoryList } from '../mocks/points-history.mock'

vi.mock('../repository/points-history.repository')

describe('PointsHistoryService', () => {
  let pointsHistoryService: PointsHistoryService
  let mockPointsHistoryRepository: InterfacePointsHistoryRepository

  beforeEach(() => {
    mockPointsHistoryRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      createInTransaction: vi.fn(),
    }
    
    pointsHistoryService = new PointsHistoryService(mockPointsHistoryRepository)
    vi.clearAllMocks()
  })

  describe('getUserPointsHistory', () => {
    it("doit retourner l'historique des points d'un utilisateur", async () => {

      vi.mocked(mockPointsHistoryRepository.findByUserId).mockResolvedValue(mockPointsHistoryList)

      const result = await pointsHistoryService.getUserPointsHistory('user-1')

      expect(result).toEqual(mockPointsHistoryList)
      expect(mockPointsHistoryRepository.findByUserId).toHaveBeenCalledWith('user-1')
    })

    it("doit retourner un tableau vide si l'utilisateur n'a pas d'historique", async () => {

      vi.mocked(mockPointsHistoryRepository.findByUserId).mockResolvedValue([])

      const result = await pointsHistoryService.getUserPointsHistory('user-sans-points')

      expect(result).toEqual([])
    })

    it("doit lever une erreur si l'ID utilisateur est vide", async () => {

      await expect(pointsHistoryService.getUserPointsHistory(''))
        .rejects.toThrow('ID utilisateur requis')
    })

    it('doit gérer les erreurs de base de données', async () => {

      vi.mocked(mockPointsHistoryRepository.findByUserId).mockRejectedValue(new Error('Erreur DB'))

      await expect(pointsHistoryService.getUserPointsHistory('user-1'))
        .rejects.toThrow('Erreur DB')
    })
  })
})