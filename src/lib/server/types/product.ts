import {
  Product,
  BoardType,
  ProductStatus,
  BoardCondition,
} from '@/generated/prisma';

export interface CreateProductData {
  name: string;
  description?: string;
  type: BoardType;
  priceEuro: number;
  pricePoints: number;
  imageUrl: string[];
  usedBoardId: string | null;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  type?: BoardType;
  priceEuro?: number;
  pricePoints?: number;
  imageUrl?: string[];
  status?: ProductStatus;
}

export interface ProductFilters {
  types?: BoardType[];
  priceRange?: [number, number];
  status?: ProductStatus;
  search?: string;
  usedBoardId?: string;
}

export interface PurchaseProductData {
  productId: string;
  userId: string;
}

export interface ProductWithRelations extends Product {
  usedBoard?: {
    id: string;
    name: string;
    boardType: BoardType;
    boardCondition: BoardCondition | null;
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  type: string;
  priceEuro: string;
  pricePoints: string;
  usedBoardId: string;
  images: File[];
}
