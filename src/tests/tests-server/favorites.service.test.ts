import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FavoriteService } from '../../lib/server/favorites/favorites.service'
import { InterfaceFavoriteRepository } from '../../lib/server/favorites/repository/interface-favorites.repository'
import { InterfaceProductRepository } from '../../lib/server/products/repository/interface-products.repository'
import { mockFavorite, mockProduct, mockFavoriteWithProduct } from '../mocks/favorites.mock'

vi.mock('../repository/favorites.repository')
vi.mock('../../products/repository/products.repository')

describe('FavoriteService', () => {
  let favoriteService: FavoriteService
  let mockFavoriteRepository: InterfaceFavoriteRepository
  let mockProductRepository: InterfaceProductRepository

  beforeEach(() => {
    mockFavoriteRepository = {
      findByUserId: vi.fn(),
      exists: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    }

    mockProductRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findAllWithPagination: vi.fn(),
      findAvailable: vi.fn(),
      findLatest: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateManyStatus: vi.fn(),
    }
    
    favoriteService = new FavoriteService(mockFavoriteRepository, mockProductRepository)
    vi.clearAllMocks()
  })

  describe('getUserFavorites', () => {
    it("doit retourner les favoris d'un utilisateur avec pagination", async () => {
      const mockPaginatedResponse = {
        data: [mockFavoriteWithProduct],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }

      vi.mocked(mockFavoriteRepository.findByUserId).mockResolvedValue(mockPaginatedResponse)

      const result = await favoriteService.getUserFavorites('user-1', { page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockFavoriteRepository.findByUserId).toHaveBeenCalledWith('user-1', 1, 20)
    })

    it("doit retourner une réponse paginée vide si l'utilisateur n'a pas de favoris", async () => {
      const mockEmptyPaginatedResponse = {
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }

      vi.mocked(mockFavoriteRepository.findByUserId).mockResolvedValue(mockEmptyPaginatedResponse)

      const result = await favoriteService.getUserFavorites('user-1', { page: 1, limit: 20 })

      expect(result).toEqual(mockEmptyPaginatedResponse)
    })

    it('doit normaliser les paramètres de pagination', async () => {
      const mockPaginatedResponse = {
        data: [mockFavoriteWithProduct],
        meta: {
          currentPage: 2,
          totalPages: 3,
          totalItems: 50,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: true,
        }
      }

      vi.mocked(mockFavoriteRepository.findByUserId).mockResolvedValue(mockPaginatedResponse)

      const result = await favoriteService.getUserFavorites('user-1', { page: 2, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockFavoriteRepository.findByUserId).toHaveBeenCalledWith('user-1', 2, 20)
    })
  })

  describe('isFavorite', () => {
    it('doit retourner true si le produit est dans les favoris', async () => {
      vi.mocked(mockFavoriteRepository.exists).mockResolvedValue(true)

      const result = await favoriteService.isFavorite('user-1', 'product-1')

      expect(result).toBe(true)
      expect(mockFavoriteRepository.exists).toHaveBeenCalledWith('user-1', 'product-1')
    })

    it("doit retourner false si le produit n'est pas dans les favoris", async () => {
      vi.mocked(mockFavoriteRepository.exists).mockResolvedValue(false)

      const result = await favoriteService.isFavorite('user-1', 'product-1')

      expect(result).toBe(false)
    })
  })

  describe('toggleFavorite', () => {
    it("doit ajouter un produit aux favoris s'il n'y est pas déjà", async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)
      vi.mocked(mockFavoriteRepository.exists).mockResolvedValue(false)
      vi.mocked(mockFavoriteRepository.create).mockResolvedValue(mockFavorite)

      const result = await favoriteService.toggleFavorite('user-1', 'product-1')

      expect(result).toEqual({
        action: 'added',
        message: 'Ajouté aux favoris'
      })
      expect(mockFavoriteRepository.create).toHaveBeenCalledWith('user-1', 'product-1')
    })

    it("doit retirer un produit des favoris s'il y est déjà", async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)
      vi.mocked(mockFavoriteRepository.exists).mockResolvedValue(true)
      vi.mocked(mockFavoriteRepository.delete).mockResolvedValue(undefined)

      const result = await favoriteService.toggleFavorite('user-1', 'product-1')

      expect(result).toEqual({
        action: 'removed',
        message: 'Retiré des favoris'
      })
      expect(mockFavoriteRepository.delete).toHaveBeenCalledWith('user-1', 'product-1')
    })

    it("doit retourner une erreur si le produit n'existe pas", async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null)

      await expect(favoriteService.toggleFavorite('user-1', 'product-1'))
        .rejects.toThrow('Produit non trouvé')

      expect(mockFavoriteRepository.exists).not.toHaveBeenCalled()
      expect(mockFavoriteRepository.create).not.toHaveBeenCalled()
      expect(mockFavoriteRepository.delete).not.toHaveBeenCalled()
    })
  })
})