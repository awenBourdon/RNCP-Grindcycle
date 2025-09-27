import { OrderStatus, PaymentType, ProductStatus, BoardType } from '@/generated/prisma'

export const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  points: 1000
}

export const mockUserWithLowPoints = {
  ...mockUser,
  points: 50
}

export const mockProduct = {
  id: 'product-1',
  name: 'Super Skateboard',
  status: ProductStatus.CATALOG
}

export const mockCartItem = {
  productId: 'product-1',
  name: 'Super Skateboard',
  type: BoardType.SKATE,
  priceEuro: 89.99,
  pricePoints: 450,
  quantity: 1
}

export const mockShippingAddress = {
  address: '123 Rue de la Paix',
  city: 'Paris',
  postalCode: '75001',
  country: 'France',
  phone: '0123456789'
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
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  user: mockUser,
  orderItems: [{
    id: 'item-1',
    orderId: 'order-1',
    productId: 'product-1',
    productName: 'Super Skateboard',
    productType: BoardType.SKATE,
    priceEuro: 89.99,
    pricePoints: 450,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    product: mockProduct
  }]
}

export const mockPointsOrder = {
  ...mockOrder,
  totalAmount: 0,
  shippingCost: 0,
  paymentType: PaymentType.POINTS,
  pointsUsed: 450,
  status: OrderStatus.CONFIRMED
}

export const mockStripePaymentData = {
  userId: 'user-1',
  cartItems: [mockCartItem],
  shippingAddress: mockShippingAddress,
  shippingCost: 9.99
}

export const mockPointsPaymentData = {
  userId: 'user-1',
  cartItems: [mockCartItem],
  shippingAddress: mockShippingAddress
}