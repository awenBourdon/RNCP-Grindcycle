import { Product, ProductStatus, BoardType } from '@/generated/prisma';
import { PaginatedResponse } from '@/lib/utils/pagination';

export interface CreateProductData {
  name: string;
  description?: string | null;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
  imageUrl: string[];
  usedBoardId?: string | null;
}

export interface UpdateProductData {
  name?: string;
  description?: string | null;
  type?: BoardType;
  priceEuro?: number;
  pricePoints?: number;
  imageUrl?: string[];
  status?: ProductStatus;
  usedBoardId?: string | null;
}

export interface ProductWithRelations extends Product {
  usedBoard?: {
    id: string;
    name: string;
    boardType: BoardType;
    boardCondition: string | null;
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
}

export interface ProductFilters {
  search?: string;
  type?: BoardType;
  minPrice?: number;
  maxPrice?: number;
  minPoints?: number;
  maxPoints?: number;
}

export interface InterfaceProductRepository {
  create(data: CreateProductData): Promise<ProductWithRelations>;
  findById(id: string): Promise<ProductWithRelations | null>;
  findAll(): Promise<ProductWithRelations[]>;
  findAvailable(
    page: number,
    limit: number,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<ProductWithRelations>>;
  findLatest(limit?: number): Promise<ProductWithRelations[]>;
  update(id: string, data: UpdateProductData): Promise<ProductWithRelations>;
  delete(id: string): Promise<void>;
  updateManyStatus(productIds: string[], status: ProductStatus): Promise<void>;
}