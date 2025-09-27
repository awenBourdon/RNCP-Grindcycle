import { OrderStatus, PaymentType, BoardType, ProductStatus } from '@/generated/prisma'

export const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com'
}

export const mockProduct = {
  id: 'product-1',
  name: 'Super Skateboard',
  type: BoardType.SKATE,
  imageUrl: ['image1.jpg'],
  status: ProductStatus.CATALOG
}

export const mockOrderItem = {
  id: 'item-1',
  orderId: 'order-1',
  productId: 'product-1',
  productName: 'Super Skateboard',
  productType: BoardType.SKATE,
  priceEuro: 89.99,
  pricePoints: 450,
  quantity: 1,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
  product: mockProduct
}

export const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  totalAmount: 89.99,
  shippingCost: 9.99,
  paymentType: PaymentType.EURO,
  pointsUsed: 0,
  status: OrderStatus.PENDING,
  shippingAddress: '123 Rue de la Paix',
  shippingCity: 'Paris',
  shippingPostalCode: '75001',
  shippingCountry: 'France',
  shippingPhone: '0123456789',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
  user: mockUser,
  orderItems: [mockOrderItem]
}

export const mockPointsOrder = {
  ...mockOrder,
  id: 'order-2',
  totalAmount: 0,
  shippingCost: 0,
  paymentType: PaymentType.POINTS,
  pointsUsed: 450,
  status: OrderStatus.CONFIRMED
}

export const mockConfirmedOrder = {
  ...mockOrder,
  status: OrderStatus.CONFIRMED
}

export const mockShippedOrder = {
  ...mockOrder,
  status: OrderStatus.SHIPPED
}

export const mockDeliveredOrder = {
  ...mockOrder,
  status: OrderStatus.DELIVERED
}

export const mockCancelledOrder = {
  ...mockOrder,
  status: OrderStatus.CANCELLED
}

export const mockOrders = [
  mockOrder,
  mockPointsOrder,
  mockConfirmedOrder,
  mockShippedOrder
]

export const mockUserOrders = [
  mockOrder,
  mockPointsOrder
]