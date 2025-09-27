/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PaymentService } from '../../lib/server/payments/payments.service'
import { ProductStatus, OrderStatus } from '@/generated/prisma'
import {
  mockProduct,
  mockOrder,
  mockPointsOrder,
  mockStripePaymentData,
  mockPointsPaymentData
} from '../mocks/payments.mock'

vi.mock('../repository/payments.repository')
vi.mock('../../orders/orders.service')
vi.mock('../../order-items/order-items.service')
vi.mock('../../products/products.service')
vi.mock('../../users/users-service')
vi.mock('../../points-history/points-history.service')
vi.mock('../../notifications/notifications.service')

describe('PaymentService', () => {
  let paymentService: PaymentService
  
  const mockOrderRepository = {
    create: vi.fn(),
  }

  const mockOrderItemRepository = {
    createMultiple: vi.fn(),
  }

  const mockProductRepository = {
    updateManyStatus: vi.fn(),
  }

  const mocks = {
    paymentRepo: {
      executePointsPaymentTransaction: vi.fn(),
      executeStripeConfirmationTransaction: vi.fn(),
      cleanupFavoritesForPurchase: vi.fn(),
    },
    orderService: {
      getOrderById: vi.fn(),
      updateOrderStatus: vi.fn(),
      getRepository: () => mockOrderRepository
    },
    orderItemService: {
      getRepository: () => mockOrderItemRepository
    },
    productService: {
      getProductById: vi.fn(),
      getRepository: () => mockProductRepository
    },
    userService: {
      getUserPoints: vi.fn(),
      getRepository: () => ({
        updatePointsInTransaction: vi.fn(),
      })
    },
    pointsHistoryService: {
      getRepository: () => ({
        createInTransaction: vi.fn(),
      })
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockOrderRepository.create.mockResolvedValue(mockOrder)
    mockOrderItemRepository.createMultiple.mockResolvedValue([])
    
    paymentService = new PaymentService(
      mocks.paymentRepo as any,
      mocks.orderService as any,
      mocks.orderItemService as any,
      mocks.productService as any,
      mocks.userService as any,
      mocks.pointsHistoryService as any
    )
  })

  describe('processStripePayment', () => {
    it('doit traiter un paiement Stripe avec succès', async () => {

      mocks.productService.getProductById.mockResolvedValue(mockProduct)
      mocks.orderService.getOrderById.mockResolvedValue(mockOrder)

      const result = await paymentService.processStripePayment(mockStripePaymentData)


      expect(result).toEqual(mockOrder)
      expect(mocks.productService.getProductById).toHaveBeenCalledWith('product-1')
    })

    it('doit retourner une erreur si le panier est vide', async () => {

      const invalidData = { ...mockStripePaymentData, cartItems: [] }

      await expect(paymentService.processStripePayment(invalidData))
        .rejects.toThrow('Panier vide')
    })

    it("doit retourner une erreur si pas d'adresse de livraison", async () => {

      const invalidData = { ...mockStripePaymentData, shippingAddress: null as any }

      await expect(paymentService.processStripePayment(invalidData))
        .rejects.toThrow('Adresse de livraison requise')
    })

    it('doit retourner une erreur si frais de livraison négatifs', async () => {

      const invalidData = { ...mockStripePaymentData, shippingCost: -5 }

      await expect(paymentService.processStripePayment(invalidData))
        .rejects.toThrow('Frais de livraison invalides')
    })

    it('doit retourner une erreur si produit plus disponible', async () => {

      const unavailableProduct = { ...mockProduct, status: ProductStatus.SOLD }
      mocks.productService.getProductById.mockResolvedValue(unavailableProduct)


      await expect(paymentService.processStripePayment(mockStripePaymentData))
        .rejects.toThrow('Le produit "Super Skateboard" n\'est plus disponible')
    })
  })

  describe('confirmStripePayment', () => {
    it('doit confirmer un paiement Stripe avec succès', async () => {

      const confirmedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED }
      mocks.paymentRepo.executeStripeConfirmationTransaction.mockResolvedValue(confirmedOrder)

      const result = await paymentService.confirmStripePayment('order-1')

      expect(result).toEqual(confirmedOrder)
      expect(mocks.paymentRepo.executeStripeConfirmationTransaction).toHaveBeenCalledWith('order-1', expect.any(Object))
    })

    it('doit retourner une erreur si ID commande vide', async () => {

      await expect(paymentService.confirmStripePayment(''))
        .rejects.toThrow('ID de commande requis')
    })
  })

  describe('processPointsPayment', () => {
    it('doit traiter un paiement par points avec succès', async () => {

      mocks.productService.getProductById.mockResolvedValue(mockProduct)
      mocks.userService.getUserPoints.mockResolvedValue(1000)
      mocks.paymentRepo.executePointsPaymentTransaction.mockResolvedValue(mockPointsOrder)
      mocks.orderService.getOrderById.mockResolvedValue(mockPointsOrder)

      const result = await paymentService.processPointsPayment(mockPointsPaymentData)

      expect(result).toEqual(mockPointsOrder)
      expect(mocks.userService.getUserPoints).toHaveBeenCalledWith('user-1')
    })

    it('doit retourner une erreur si pas assez de points', async () => {

      mocks.productService.getProductById.mockResolvedValue(mockProduct)
      mocks.userService.getUserPoints.mockResolvedValue(50) // Pas assez


      await expect(paymentService.processPointsPayment(mockPointsPaymentData))
        .rejects.toThrow('Points insuffisants. Tu as 50 points, 450 requis.')
    })

    it("doit retourner une erreur si pas d'utilisateur", async () => {

      const invalidData = { ...mockPointsPaymentData, userId: '' }

      await expect(paymentService.processPointsPayment(invalidData))
        .rejects.toThrow('Utilisateur requis pour achat par points')
    })

    it('doit retourner une erreur si panier vide', async () => {

      const invalidData = { ...mockPointsPaymentData, cartItems: [] }

      await expect(paymentService.processPointsPayment(invalidData))
        .rejects.toThrow('Panier vide')
    })
  })

  describe('cancelOrder', () => {
    it('doit annuler une commande PENDING', async () => {

      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED }
      mocks.orderService.getOrderById.mockResolvedValue(mockOrder)
      mocks.orderService.updateOrderStatus.mockResolvedValue(cancelledOrder)

      const result = await paymentService.cancelOrder('order-1')

      expect(result).toEqual(cancelledOrder)
      expect(mocks.orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.CANCELLED)
    })

    it('doit retourner une erreur si commande ne peut plus être annulée', async () => {

      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED }
      mocks.orderService.getOrderById.mockResolvedValue(shippedOrder)

      await expect(paymentService.cancelOrder('order-1'))
        .rejects.toThrow('Cette commande ne peut plus être annulée')
    })

    it('doit retourner une erreur si ID commande vide', async () => {

      await expect(paymentService.cancelOrder(''))
        .rejects.toThrow('ID de commande requis')
    })
  })

  describe('Calculs', () => {
    it('doit calculer correctement le montant total', async () => {

      const multipleItems = [
        { ...mockStripePaymentData.cartItems[0], priceEuro: 50, quantity: 2 },
        { ...mockStripePaymentData.cartItems[0], productId: 'product-2', priceEuro: 30, quantity: 1 }
      ]
      const paymentData = { ...mockStripePaymentData, cartItems: multipleItems }
      
      mocks.productService.getProductById.mockResolvedValue(mockProduct)
      mocks.orderService.getOrderById.mockResolvedValue(mockOrder)

      await paymentService.processStripePayment(paymentData)

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 130
        })
      )
    })

    it('doit calculer correctement le total en points', async () => {

      const multipleItems = [
        { ...mockPointsPaymentData.cartItems[0], pricePoints: 200, quantity: 2 },
        { ...mockPointsPaymentData.cartItems[0], productId: 'product-2', pricePoints: 150, quantity: 1 }
      ]
      const paymentData = { ...mockPointsPaymentData, cartItems: multipleItems }
      
      mocks.productService.getProductById.mockResolvedValue(mockProduct)
      mocks.userService.getUserPoints.mockResolvedValue(1000)
      mocks.paymentRepo.executePointsPaymentTransaction.mockResolvedValue(mockPointsOrder)
      mocks.orderService.getOrderById.mockResolvedValue(mockPointsOrder)

      await paymentService.processPointsPayment(paymentData)

      expect(mocks.userService.getUserPoints).toHaveBeenCalledWith('user-1')
    })
  })

  describe('Gestion des erreurs', () => {
    it('doit gérer les erreurs de base de données', async () => {
        
      mocks.productService.getProductById.mockRejectedValue(new Error('Erreur DB'))

      await expect(paymentService.processStripePayment(mockStripePaymentData))
        .rejects.toThrow('Erreur DB')
    })

    it('doit gérer les erreurs de confirmation Stripe', async () => {

      mocks.paymentRepo.executeStripeConfirmationTransaction.mockRejectedValue(new Error('Erreur Stripe'))

      await expect(paymentService.confirmStripePayment('order-1'))
        .rejects.toThrow('Erreur Stripe')
    })

    it('doit gérer les erreurs de transaction points', async () => {

      mocks.productService.getProductById.mockResolvedValue(mockProduct)
      mocks.userService.getUserPoints.mockResolvedValue(1000)
      mocks.paymentRepo.executePointsPaymentTransaction.mockRejectedValue(new Error('Erreur transaction'))

      await expect(paymentService.processPointsPayment(mockPointsPaymentData))
        .rejects.toThrow('Erreur transaction')
    })
  })
})