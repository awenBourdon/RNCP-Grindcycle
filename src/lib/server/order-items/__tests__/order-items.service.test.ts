import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderItemService } from '../order-items.service'
import { InterfaceOrderItemRepository } from '../repository/interface-order-items'
import { mockOrderItem, mockOrderItems, mockCreateOrderItemData } from './order-items.mock'

vi.mock('../repository/order-items.repository')

describe('OrderItemService', () => {
  let orderItemService: OrderItemService
  let mockOrderItemRepository: InterfaceOrderItemRepository

  beforeEach(() => {
    mockOrderItemRepository = {
      findByOrderId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      createMultiple: vi.fn(),
      createMultipleInTransaction: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    
    orderItemService = new OrderItemService(mockOrderItemRepository)
    vi.clearAllMocks()
  })

  describe('getOrderItems', () => {
    it("doit retourner les items d'une commande", async () => {

      vi.mocked(mockOrderItemRepository.findByOrderId).mockResolvedValue(mockOrderItems)

      const result = await orderItemService.getOrderItems('order-1')

      expect(result).toEqual(mockOrderItems)
      expect(mockOrderItemRepository.findByOrderId).toHaveBeenCalledWith('order-1')
    })

    it("doit retourner une erreur si l'ID commande est vide", async () => {

      await expect(orderItemService.getOrderItems(''))
        .rejects.toThrow('ID de commande requis')
    })
  })

  describe('getOrderItemById', () => {
    it('doit retourner un item par son ID', async () => {

      vi.mocked(mockOrderItemRepository.findById).mockResolvedValue(mockOrderItem)

      const result = await orderItemService.getOrderItemById('item-1')

      expect(result).toEqual(mockOrderItem)
      expect(mockOrderItemRepository.findById).toHaveBeenCalledWith('item-1')
    })

    it("doit retourner une erreur si l'item n'existe pas", async () => {

      vi.mocked(mockOrderItemRepository.findById).mockResolvedValue(null)

      await expect(orderItemService.getOrderItemById('item-inexistant'))
        .rejects.toThrow('Item de commande non trouvé')
    })
  })

  describe('createOrderItem', () => {
    it('doit créer un item', async () => {

      vi.mocked(mockOrderItemRepository.create).mockResolvedValue(mockOrderItem)

      const result = await orderItemService.createOrderItem(mockCreateOrderItemData)

      expect(result).toEqual(mockOrderItem)
      expect(mockOrderItemRepository.create).toHaveBeenCalledWith(mockCreateOrderItemData)
    })

    it('doit retourner une erreur si les données sont invalides', async () => {

      const invalidData = { ...mockCreateOrderItemData, productName: '' }

      await expect(orderItemService.createOrderItem(invalidData))
        .rejects.toThrow('Nom de produit requis')
    })

    it('doit retourner une erreur si le prix est négatif', async () => {

      const invalidData = { ...mockCreateOrderItemData, priceEuro: -10 }

      await expect(orderItemService.createOrderItem(invalidData))
        .rejects.toThrow('Prix en euros ne peut pas être négatif')
    })
  })

  describe('updateOrderItem', () => {
    it('doit mettre à jour un item', async () => {

      const updateData = { productName: 'Nouveau nom' }
      const updatedItem = { ...mockOrderItem, productName: 'Nouveau nom' }
      
      vi.mocked(mockOrderItemRepository.findById).mockResolvedValue(mockOrderItem)
      vi.mocked(mockOrderItemRepository.update).mockResolvedValue(updatedItem)

      const result = await orderItemService.updateOrderItem('item-1', updateData)

      expect(result).toEqual(updatedItem)
      expect(mockOrderItemRepository.update).toHaveBeenCalledWith('item-1', updateData)
    })
  })

  describe('deleteOrderItem', () => {
    it('doit supprimer un item', async () => {

      vi.mocked(mockOrderItemRepository.findById).mockResolvedValue(mockOrderItem)
      vi.mocked(mockOrderItemRepository.delete).mockResolvedValue(undefined)

      await orderItemService.deleteOrderItem('item-1')

      expect(mockOrderItemRepository.delete).toHaveBeenCalledWith('item-1')
    })
  })
})