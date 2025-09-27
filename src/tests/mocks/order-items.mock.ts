export const mockProduct = {
  id: 'product-1',
  name: 'Super Skateboard',
  type: 'SKATE',
  imageUrl: ['image1.jpg'],
  status: 'CATALOG'
}

export const mockOrderItem = {
  id: 'item-1',
  orderId: 'order-1',
  productId: 'product-1',
  productName: 'Super Skateboard',
  productType: 'SKATE',
  priceEuro: 89.99,
  pricePoints: 450,
  quantity: 1,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
  product: mockProduct
}

export const mockOrderItems = [
  mockOrderItem,
  {
    ...mockOrderItem,
    id: 'item-2',
    productId: 'product-2',
    productName: 'Cruiser Board',
    productType: 'CRUISER',
    priceEuro: 129.99,
    pricePoints: 650,
  }
]

export const mockCreateOrderItemData = {
  orderId: 'order-1',
  productId: 'product-1',
  productName: 'Super Skateboard',
  productType: 'SKATE',
  priceEuro: 89.99,
  pricePoints: 450,
}