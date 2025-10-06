import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderService } from '../../lib/server/orders/orders.service'
import { InterfaceOrderRepository } from '../../lib/server/orders/repository/interface-orders.repository'
import { OrderStatus } from '@/generated/prisma'
import {
  mockOrder,
  mockConfirmedOrder,
  mockOrders,
  mockUserOrders
} from '../mocks/orders.mock'

vi.mock('../repository/orders.repository')

describe('OrderService', () => {
  let orderService: OrderService
  let mockOrderRepository: InterfaceOrderRepository

  beforeEach(() => {
    mockOrderRepository = {
      create: vi.fn(),
      createInTransaction: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdWithPagination: vi.fn(),
      findAll: vi.fn(),
      findAllWithPagination: vi.fn(),
      updateStatus: vi.fn(),
    }
    
    orderService = new OrderService(mockOrderRepository)
    vi.clearAllMocks()
  })

  describe('getOrderById', () => {
    it('doit retourner une commande', async () => {
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder)

      const result = await orderService.getOrderById('order-1')

      expect(result).toEqual(mockOrder)
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-1')
    })

    it("doit retourner une erreur si la commande n'existe pas", async () => {
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(null)

      await expect(orderService.getOrderById('order-inexistant'))
        .rejects.toThrow('Commande non trouvée')
    })

    it("doit retourner une erreur si l'ID est vide", async () => {
      await expect(orderService.getOrderById(''))
        .rejects.toThrow('ID de commande requis')
    })
  })

  describe('getUserOrders', () => {
    it("doit retourner les commandes d'un utilisateur sans pagination", async () => {
      vi.mocked(mockOrderRepository.findByUserId).mockResolvedValue(mockUserOrders)

      const result = await orderService.getUserOrders('user-1')

      expect(result).toEqual(mockUserOrders)
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith('user-1')
    })

    it("doit retourner un tableau vide si l'utilisateur n'a pas de commandes", async () => {
      vi.mocked(mockOrderRepository.findByUserId).mockResolvedValue([])

      const result = await orderService.getUserOrders('user-sans-commandes')

      expect(result).toEqual([])
    })

    it("doit retourner une erreur quand l'ID utilisateur est vide", async () => {
      await expect(orderService.getUserOrders(''))
        .rejects.toThrow('ID utilisateur requis')
    })
  })

  describe('getUserOrdersWithPagination', () => {
    it("doit retourner les commandes d'un utilisateur avec pagination", async () => {
      const mockPaginatedResponse = {
        data: mockUserOrders,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }

      vi.mocked(mockOrderRepository.findByUserIdWithPagination).mockResolvedValue(mockPaginatedResponse)

      const result = await orderService.getUserOrdersWithPagination('user-1', { page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockOrderRepository.findByUserIdWithPagination).toHaveBeenCalledWith('user-1', 1, 20)
    })

    it("doit normaliser les paramètres de pagination", async () => {
      const mockPaginatedResponse = {
        data: mockUserOrders,
        meta: {
          currentPage: 2,
          totalPages: 3,
          totalItems: 50,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: true,
        }
      }

      vi.mocked(mockOrderRepository.findByUserIdWithPagination).mockResolvedValue(mockPaginatedResponse)

      const result = await orderService.getUserOrdersWithPagination('user-1', { page: 2, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockOrderRepository.findByUserIdWithPagination).toHaveBeenCalledWith('user-1', 2, 20)
    })

    it("doit retourner une erreur quand l'ID utilisateur est vide", async () => {
      await expect(orderService.getUserOrdersWithPagination('', { page: 1, limit: 20 }))
        .rejects.toThrow('ID utilisateur requis')
    })
  })

  describe('getAllOrders', () => {
    it('doit retourner toutes les commandes sans pagination', async () => {
      vi.mocked(mockOrderRepository.findAll).mockResolvedValue(mockOrders)

      const result = await orderService.getAllOrders()

      expect(result).toEqual(mockOrders)
      expect(mockOrderRepository.findAll).toHaveBeenCalled()
    })

    it("doit retourner un tableau vide s'il n'y a pas de commandes", async () => {
      vi.mocked(mockOrderRepository.findAll).mockResolvedValue([])

      const result = await orderService.getAllOrders()

      expect(result).toEqual([])
    })
  })

  describe('getAllOrdersWithPagination', () => {
    it('doit retourner toutes les commandes avec pagination', async () => {
      const mockPaginatedResponse = {
        data: mockOrders,
        meta: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: false,
        }
      }

      vi.mocked(mockOrderRepository.findAllWithPagination).mockResolvedValue(mockPaginatedResponse)

      const result = await orderService.getAllOrdersWithPagination({ page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockOrderRepository.findAllWithPagination).toHaveBeenCalledWith(1, 20)
    })

    it("doit gérer la pagination sur plusieurs pages", async () => {
      const mockPaginatedResponse = {
        data: mockOrders,
        meta: {
          currentPage: 3,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: true,
        }
      }

      vi.mocked(mockOrderRepository.findAllWithPagination).mockResolvedValue(mockPaginatedResponse)

      const result = await orderService.getAllOrdersWithPagination({ page: 3, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockOrderRepository.findAllWithPagination).toHaveBeenCalledWith(3, 20)
    })
  })

  describe('updateOrderStatus', () => {
    it("doit mettre à jour le statut d'une commande existante", async () => {
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder)
      vi.mocked(mockOrderRepository.updateStatus).mockResolvedValue(mockConfirmedOrder)

      const result = await orderService.updateOrderStatus('order-1', OrderStatus.CONFIRMED)

      expect(result).toEqual(mockConfirmedOrder)
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-1')
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.CONFIRMED)
    })

    it("doit retourner une erreur si la commande n'existe pas", async () => {
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(null)

      await expect(orderService.updateOrderStatus('order-inexistant', OrderStatus.CONFIRMED))
        .rejects.toThrow('Commande non trouvée')

      expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled()
    })

    it('doit retourner une erreur pour un statut invalide', async () => {
      await expect(orderService.updateOrderStatus('order-1', 'INVALID_STATUS' as OrderStatus))
        .rejects.toThrow('Statut de commande invalide')

      expect(mockOrderRepository.findById).not.toHaveBeenCalled()
    })

    it("doit retourner une erreur quand l'ID commande est vide", async () => {
      await expect(orderService.updateOrderStatus('', OrderStatus.CONFIRMED))
        .rejects.toThrow('ID de commande requis')
    })

    describe('Transitions de statut valides', () => {
      const statusTransitions = [
        { from: OrderStatus.PENDING, to: OrderStatus.CONFIRMED, description: 'PENDING vers CONFIRMED' },
        { from: OrderStatus.CONFIRMED, to: OrderStatus.SHIPPED, description: 'CONFIRMED vers SHIPPED' },
        { from: OrderStatus.SHIPPED, to: OrderStatus.DELIVERED, description: 'SHIPPED vers DELIVERED' },
        { from: OrderStatus.PENDING, to: OrderStatus.CANCELLED, description: 'PENDING vers CANCELLED' }
      ]

      statusTransitions.forEach(({ from, to, description }) => {
        it(`doit permettre la transition ${description}`, async () => {
          const orderWithStatus = { ...mockOrder, status: from }
          const updatedOrder = { ...mockOrder, status: to }
          
          vi.mocked(mockOrderRepository.findById).mockResolvedValue(orderWithStatus)
          vi.mocked(mockOrderRepository.updateStatus).mockResolvedValue(updatedOrder)

          const result = await orderService.updateOrderStatus('order-1', to)

          expect(result.status).toBe(to)
          expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith('order-1', to)
        })
      })
    })
  })

  describe('Gestion des erreurs', () => {
    it('doit gérer les erreurs de base de données lors de la récupération', async () => {
      vi.mocked(mockOrderRepository.findById).mockRejectedValue(new Error('Erreur DB'))

      await expect(orderService.getOrderById('order-1'))
        .rejects.toThrow('Erreur DB')
    })

    it('doit gérer les erreurs de base de données lors de la mise à jour', async () => {
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder)
      vi.mocked(mockOrderRepository.updateStatus).mockRejectedValue(new Error('Erreur mise à jour'))

      await expect(orderService.updateOrderStatus('order-1', OrderStatus.CONFIRMED))
        .rejects.toThrow('Erreur mise à jour')
    })
  })

  describe('Tests de régression', () => {
    it('doit préserver les données de la commande lors de la mise à jour du statut', async () => {
      const originalOrder = { ...mockOrder }
      const updatedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED }
      
      vi.mocked(mockOrderRepository.findById).mockResolvedValue(originalOrder)
      vi.mocked(mockOrderRepository.updateStatus).mockResolvedValue(updatedOrder)

      const result = await orderService.updateOrderStatus('order-1', OrderStatus.CONFIRMED)

      expect(result.id).toBe(originalOrder.id)
      expect(result.userId).toBe(originalOrder.userId)
      expect(result.totalAmount).toBe(originalOrder.totalAmount)
      expect(result.user).toEqual(originalOrder.user)
      expect(result.orderItems).toEqual(originalOrder.orderItems)
      expect(result.status).toBe(OrderStatus.CONFIRMED)
    })
  })
})