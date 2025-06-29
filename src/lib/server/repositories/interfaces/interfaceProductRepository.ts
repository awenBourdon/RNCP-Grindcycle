import { Product } from '@/generated/prisma'
import { CreateProductData, ProductFilters, ProductWithRelations } from '@/lib/server/types/product';

export interface InterfaceProductRepository {
  create(data: CreateProductData): Promise<ProductWithRelations>
  findById(id: string): Promise<ProductWithRelations | null>
  findAll(filters?: ProductFilters): Promise<ProductWithRelations[]>
  findAvailable(): Promise<ProductWithRelations[]>
  update(id: string, data: Partial<Product>): Promise<ProductWithRelations>
  delete(id: string): Promise<void>
  findByUsedBoardId(usedBoardId: string): Promise<ProductWithRelations | null>
}