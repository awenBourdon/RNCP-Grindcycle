/**
 * PRODUCT DATA ACCESS LAYER REPOSITORY
 * 
 * This repository implements the data access layer for product management, providing a clean
 * abstraction over Prisma ORM operations. It encapsulates all database interactions related
 * to products in the skateboard marketplace, ensuring consistent data retrieval patterns
 * and optimal query performance through strategic relation loading.
 * 
 * Core Responsibilities:
 * - CRUD operations for products with related data (used boards, users)
 * - Advanced filtering and search capabilities for product discovery
 * - Status-based queries for marketplace catalog management
 * - Price range and type filtering for enhanced user experience
 * - Counting and analytics operations for dashboard metrics
 * 
 * Key Features:
 * - Consistent relation loading with optimized select clauses
 * - Flexible filtering system supporting multiple criteria combinations
 * - Case-insensitive search across name and description fields
 * - Price range filtering for budget-conscious shopping
 * - Status workflow support (CATALOG vs PURCHASED products)
 * - Type-based categorization for board specialization
 * 
 * Query Optimization:
 * - Strategic use of select clauses to minimize data transfer
 * - Proper indexing support through where clause structure
 * - Relation loading only when needed to prevent N+1 queries
 * - Efficient counting operations for pagination and metrics
 * 
 * Data Relations:
 * - Products are linked to used boards (source of recycled materials)
 * - Used boards connect to original owners for transparency
 * - Consistent ordering by creation date for chronological listing
 */

import { prisma } from '@/lib/prisma'
import { BoardType, Product, ProductStatus } from '@/generated/prisma'
import { CreateProductData, ProductFilters, ProductWithRelations } from '@/lib/server/types/product'
import { InterfaceProductRepository } from './interfaces/interfaceProductRepository'

export class ProductRepository implements InterfaceProductRepository {
  async create(data: CreateProductData): Promise<ProductWithRelations> {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        priceEuro: data.priceEuro,
        pricePoints: data.pricePoints,
        imageUrl: data.imageUrl,
        usedBoardId: data.usedBoardId,
        status: ProductStatus.CATALOG,
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
    })
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        usedBoard: {
          select: {
            id: true,
            name: true,
            boardType: true,
            boardCondition: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
  }

  async findAll(filters?: ProductFilters): Promise<ProductWithRelations[]> {
    const where: Record<string, unknown> = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.types && filters.types.length > 0) {
      where.type = { in: filters.types }
    }

    if (filters?.priceRange) {
      where.priceEuro = {
        gte: filters.priceRange[0],
        lte: filters.priceRange[1]
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters?.usedBoardId) {
      where.usedBoardId = filters.usedBoardId
    }

    return await prisma.product.findMany({
      where,
      include: {
        usedBoard: {
          select: {
            id: true,
            name: true,
            boardType: true,
            boardCondition: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findAvailable(): Promise<ProductWithRelations[]> {
    return this.findAll({ status: ProductStatus.CATALOG })
  }

  async update(id: string, data: Partial<Product>): Promise<ProductWithRelations> {
    return await prisma.product.update({
      where: { id },
      data,
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
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id }
    })
  }

  async findByUsedBoardId(usedBoardId: string): Promise<ProductWithRelations | null> {
    return await prisma.product.findFirst({
      where: { usedBoardId },
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
    })
  }

  async findByStatus(status: ProductStatus): Promise<ProductWithRelations[]> {
    return this.findAll({ status })
  }

  async findByType(type: BoardType): Promise<ProductWithRelations[]> {
    return await prisma.product.findMany({
      where: { type },
      include: {
        usedBoard: {
          select: {
            id: true,
            name: true,
            boardType: true,
            boardCondition: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findByPriceRange(min: number, max: number): Promise<ProductWithRelations[]> {
    return this.findAll({ priceRange: [min, max] })
  }

  async countAll(): Promise<number> {
    return await prisma.product.count()
  }

  async countByStatus(status: ProductStatus): Promise<number> {
    return await prisma.product.count({
      where: { status }
    })
  }
}