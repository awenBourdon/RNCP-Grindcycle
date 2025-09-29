// src/lib/server/products/repository/products.repository.ts

import { prisma } from '@/lib/utils/prisma';
import { ProductStatus, Prisma } from '@/generated/prisma';
import {
  InterfaceProductRepository,
  CreateProductData,
  UpdateProductData,
  ProductWithRelations,
  ProductFilters
} from './interface-products.repository';
import { PaginatedResponse, createPaginatedResponse } from '@/lib/utils/pagination';

export class ProductRepository implements InterfaceProductRepository {

  async create(data: CreateProductData): Promise<ProductWithRelations> {
    const product = await prisma.product.create({
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
      include: this.getIncludeRelations(),
    });

    return product as ProductWithRelations;
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    const product = await prisma.product.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
      include: this.getIncludeRelations(),
    });

    return product as ProductWithRelations | null;
  }

  async findAll(): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return products as ProductWithRelations[];
  }

  /**
   * Récupère les produits disponibles avec pagination et filtres
   */
  async findAvailable(
    page: number,
    limit: number,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<ProductWithRelations>> {
    const skip = (page - 1) * limit;
    
    // Construction de la clause WHERE avec filtres
    const where = this.buildWhereClause(filters, ProductStatus.CATALOG);

    // Exécution parallèle de la requête de données et du comptage
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: this.getIncludeRelations(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return createPaginatedResponse(
      products as ProductWithRelations[],
      total,
      page,
      limit
    );
  }

  async findLatest(limit: number = 6): Promise<ProductWithRelations[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const products = await prisma.product.findMany({
      where: { 
        deletedAt: null,
        status: ProductStatus.CATALOG 
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });

    return products as ProductWithRelations[];
  }

  async update(id: string, data: UpdateProductData): Promise<ProductWithRelations> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        priceEuro: data.priceEuro,
        pricePoints: data.pricePoints,
        imageUrl: data.imageUrl,
        status: data.status,
        usedBoardId: data.usedBoardId,
      },
      include: this.getIncludeRelations(),
    });

    return product as ProductWithRelations;
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  async updateManyStatus(productIds: string[], status: ProductStatus): Promise<void> {
    await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: { status }
    });
  }


  private buildWhereClause(
    filters?: ProductFilters,
    defaultStatus?: ProductStatus
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (defaultStatus) {
      where.status = defaultStatus;
    }

    if (!filters) return where;

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.priceEuro = {};
      if (filters.minPrice !== undefined) {
        where.priceEuro.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.priceEuro.lte = filters.maxPrice;
      }
    }

    if (filters.minPoints !== undefined || filters.maxPoints !== undefined) {
      where.pricePoints = {};
      if (filters.minPoints !== undefined) {
        where.pricePoints.gte = filters.minPoints;
      }
      if (filters.maxPoints !== undefined) {
        where.pricePoints.lte = filters.maxPoints;
      }
    }

    return where;
  }

  private getIncludeRelations() {
    return {
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
              email: true,
            },
          },
        },
      },
    };
  }
}