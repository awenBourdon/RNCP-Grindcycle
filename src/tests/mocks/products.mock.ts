import { ProductStatus, BoardType } from '@/generated/prisma'

export const mockProduct = {
  id: 'product-1',
  name: 'Super Skateboard Pro',
  description: 'Un skateboard de qualité professionnelle',
  type: BoardType.SKATE,
  priceEuro: 129.99,
  pricePoints: 650,
  imageUrl: ['image1.jpg', 'image2.jpg'],
  status: ProductStatus.CATALOG,
  usedBoardId: 'used-board-1',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
  usedBoard: {
    id: 'used-board-1',
    name: 'Ancienne planche recyclée',
    boardType: BoardType.SKATE,
    boardCondition: 'GOOD',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
}

export const mockProductWithoutUsedBoard = {
  ...mockProduct,
  id: 'product-2',
  name: 'Nouveau Cruiser',
  type: BoardType.CRUISER,
  usedBoardId: null,
  usedBoard: null,
}

export const mockSoldProduct = {
  ...mockProduct,
  id: 'product-3',
  name: 'Produit Vendu',
  status: ProductStatus.SOLD,
}

export const mockProducts = [
  mockProduct,
  mockProductWithoutUsedBoard,
  mockSoldProduct
]

export const mockCreateProductData = {
  name: 'Nouveau Longboard',
  description: 'Description du longboard',
  type: BoardType.LONG,
  priceEuro: 199.99,
  pricePoints: 999,
  usedBoardId: 'used-board-2',
}

export const mockImageUploadSuccess = {
  success: true,
  urls: ['uploaded1.jpg', 'uploaded2.jpg'],
  errors: [],
  warnings: [],
}

export const mockImageUploadFailure = {
  success: false,
  urls: [],
  errors: ['Erreur upload image'],
  warnings: [],
}

export const mockFiles = [
  new File(['fake content'], 'test1.jpg', { type: 'image/jpeg' }),
  new File(['fake content'], 'test2.jpg', { type: 'image/jpeg' }),
] as File[]