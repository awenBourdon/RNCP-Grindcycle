import { BoardType, ProductStatus } from '@/generated/prisma'

export const mockFavorite = {
  userId: 'user-1',
  productId: 'product-1',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
}

export const mockProduct = {
  id: 'product-1',
  name: 'Test Skateboard',
  description: 'Super skateboard de test',
  type: BoardType.SKATE,
  priceEuro: 89.99,
  pricePoints: 450,
  imageUrl: ['image1.jpg', 'image2.jpg'],
  status: ProductStatus.CATALOG,
  usedBoardId: null,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
}

export const mockFavoriteWithProduct = {
  ...mockFavorite,
  product: {
    id: 'product-1',
    name: 'Test Skateboard',
    type: 'SKATE',
    priceEuro: 89.99,
    pricePoints: 450,
    imageUrl: ['image1.jpg', 'image2.jpg'],
    status: 'CATALOG',
    usedBoard: null,
  }
}