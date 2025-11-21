import { Favorite } from '@/generated/prisma';
import { PaginatedResponse } from '@/lib/utils/pagination';

export interface FavoriteWithProduct extends Favorite {
  product: {
    id: string;
    name: string;
    type: string;
    priceEuro: number;
    pricePoints: number;
    imageUrl: string[];
    status: string;
    usedBoard: {
      name: string;
    } | null;
  };
}

export interface InterfaceFavoriteRepository {
  findByUserId(userId: string, page: number, limit: number): Promise<PaginatedResponse<FavoriteWithProduct>>;
  exists(userId: string, productId: string): Promise<boolean>;
  create(userId: string, productId: string): Promise<Favorite>;
  delete(userId: string, productId: string): Promise<void>;
}