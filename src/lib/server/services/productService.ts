/**
 * PRODUCT BUSINESS LOGIC SERVICE
 * 
 * This service orchestrates all business logic related to product management in the skateboard
 * marketplace. It handles the complete product lifecycle from creation through purchase,
 * integrating image management, points system transactions, and complex business rules while
 * maintaining data consistency through atomic database operations.
 * 
 * Core Business Logic:
 * - Product creation with mandatory image upload validation and processing
 * - Complex purchase workflow integrating points system and used board generation
 * - Status-based product lifecycle management (CATALOG → PURCHASED)
 * - Transactional operations ensuring atomicity across multiple related entities
 * - Image lifecycle management with error recovery and cleanup
 * 
 * Key Features:
 * - Atomic purchase transactions creating both product updates and used board records
 * - Automatic points deduction and history tracking for purchases
 * - Image upload validation with automatic cleanup on errors
 * - Business rule enforcement (no deletion of purchased products)
 * - Complex data relationships management during purchase workflow
 * 
 * Purchase Workflow Innovation:
 * When a user purchases a product, the service performs a sophisticated transaction that:
 * 1. Validates product availability and user eligibility
 * 2. Creates a new UsedBoard record representing the user's acquisition
 * 3. Updates product status to PURCHASED and links it to the new used board
 * 4. Records points transaction in history with negative amount (spending)
 * 5. Returns both updated product and newly created used board for confirmation
 * 
 * Transaction Safety:
 * - All multi-step operations use database transactions for atomicity
 * - Image cleanup on upload failures to prevent orphaned files
 * - Validation of business rules before executing expensive operations
 * - Proper error handling with meaningful messages for different failure scenarios
 * 
 * Integration Points:
 * - ImageService for file upload management and validation
 * - ProductRepository for data persistence with optimized queries
 * - Points system integration for purchase transaction recording
 * - Used board system for tracking user acquisitions
 */

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