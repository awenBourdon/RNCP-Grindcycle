import { Product, ProductStatus, BoardType } from '@/generated/prisma';

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

export interface InterfaceProductRepository {
  create(data: CreateProductData): Promise<ProductWithRelations>;
  findById(id: string): Promise<ProductWithRelations | null>;
  findAll(): Promise<ProductWithRelations[]>;
  findAvailable(): Promise<ProductWithRelations[]>;
  findLatest(limit?: number): Promise<ProductWithRelations[]>;
  update(id: string, data: UpdateProductData): Promise<ProductWithRelations>;
  delete(id: string): Promise<void>;
  updateManyStatus(productIds: string[], status: ProductStatus): Promise<void>;
}