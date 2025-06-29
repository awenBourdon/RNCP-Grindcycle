// lib/server/services/productService.ts
import { ProductStatus, UsedBoardStatus, BoardCondition, UsedBoard } from '@/generated/prisma'
import { ProductRepository } from '@/lib/server/repositories/productRepository'
import { CreateProductData, PurchaseProductData, ProductWithRelations } from '@/lib/server/types/product'
import { ImageService } from '@/lib/server/utils/imageService'
import { API_MESSAGES } from '@/lib/server/config/constants'
import { prisma } from '@/lib/prisma'
import { PointsType } from '@/generated/prisma'
import { InterfaceProductRepository } from '../repositories/interfaces/interfaceProductRepository'

export interface PurchaseResult {
  product: ProductWithRelations
  usedBoard: UsedBoard
}

export class ProductService {
  constructor(
    private productRepository: InterfaceProductRepository = new ProductRepository(),
    private imageService: ImageService = new ImageService('products')
  ) {}

  async createProduct(
    data: Omit<CreateProductData, 'imageUrl'>, 
    imageFiles: File[]
  ): Promise<ProductWithRelations> {
    const imageResult = await this.imageService.uploadMultiple(imageFiles)
    
    if (!imageResult.success) {
      throw new Error(`Erreur upload images: ${imageResult.errors.join(', ')}`)
    }

    if (imageResult.paths.length === 0) {
      throw new Error(API_MESSAGES.AT_LEAST_ONE_IMAGE_REQUIRED)
    }

    const productData: CreateProductData = {
      ...data,
      imageUrl: imageResult.paths
    }

    try {
      return await this.productRepository.create(productData)
    } catch (error) {
      await this.imageService.deleteMultiple(imageResult.paths)
      throw error
    }
  }

  async getAllProducts(): Promise<ProductWithRelations[]> {
    return await this.productRepository.findAll()
  }

  async getAvailableProducts(): Promise<ProductWithRelations[]> {
    return await this.productRepository.findAvailable()
  }

  async getProductById(id: string): Promise<ProductWithRelations> {
    const product = await this.productRepository.findById(id)
    
    if (!product) {
      throw new Error(API_MESSAGES.PRODUCT_NOT_FOUND)
    }

    return product
  }

  async purchaseProduct(data: PurchaseProductData): Promise<PurchaseResult> {
    const product = await this.getProductById(data.productId)

    if (product.status === ProductStatus.PURCHASED) {
      throw new Error(API_MESSAGES.PRODUCT_ALREADY_PURCHASED)
    }

    return await prisma.$transaction(async (tx) => {
      const usedBoard = await tx.usedBoard.create({
        data: {
          name: product.name,
          user: { connect: { id: data.userId } },
          status: UsedBoardStatus.RECEIVED,
          boardCondition: BoardCondition.GOOD,
          boardType: product.type,
          image: product.imageUrl,
          pointsAwarded: product.pricePoints,
        },
      })

      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: {
          status: ProductStatus.PURCHASED,
          usedBoard: { connect: { id: usedBoard.id } },
        },
        include: {
          usedBoard: {
            select: {
              id: true,
              name: true,
              boardType: true,
              boardCondition: true,
            }
          }
        }
      }) as ProductWithRelations

      await tx.pointsHistory.create({
        data: {
          user: { connect: { id: data.userId } },
          usedBoardId: usedBoard.id,
          type: PointsType.PURCHASE,
          pointsAmount: -product.pricePoints,
        },
      })

      return { 
        product: updatedProduct, 
        usedBoard 
      }
    })
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id)

    if (product.status === ProductStatus.PURCHASED) {
      throw new Error('Impossible de supprimer un produit acheté')
    }

    if (product.imageUrl && product.imageUrl.length > 0) {
      await this.imageService.deleteMultiple(product.imageUrl)
    }

    await this.productRepository.delete(id)
  }
}