import { prisma } from '@/lib/prisma';
import { Favorite } from '@/generated/prisma';
import { FavoriteWithProduct, InterfaceFavoriteRepository } from './interface-favorites.repository';

export class FavoriteRepository implements InterfaceFavoriteRepository {
  
  async findByUserId(userId: string): Promise<FavoriteWithProduct[]> {
    return await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            usedBoard: { 
              select: { name: true } 
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exists(userId: string, productId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return !!favorite;
  }

  async create(userId: string, productId: string): Promise<Favorite> {
    return await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });
  }

  async delete(userId: string, productId: string): Promise<void> {
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}