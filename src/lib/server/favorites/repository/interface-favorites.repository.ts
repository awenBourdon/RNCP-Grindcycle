import { Favorite } from '@/generated/prisma';

export interface FavoriteWithProduct extends Favorite {
  product: {
    id: string;
    name: string;
    type: string;
    priceEuro: number;
    pricePoints: number | null;
    imageUrl: string[];
    status: string;
    usedBoard: {
      name: string;
    } | null;
  };
}

export interface InterfaceFavoriteRepository {
  findByUserId(userId: string): Promise<FavoriteWithProduct[]>;
  exists(userId: string, productId: string): Promise<boolean>;
  create(userId: string, productId: string): Promise<Favorite>;
  delete(userId: string, productId: string): Promise<void>;
}