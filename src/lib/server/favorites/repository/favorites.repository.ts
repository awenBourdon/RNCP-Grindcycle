import { prisma } from '@/lib/utils/prisma';
import { Favorite } from '@/generated/prisma';
import { FavoriteWithProduct, InterfaceFavoriteRepository } from './interface-favorites.repository';
import { PaginatedResponse, createPaginatedResponse } from '@/lib/utils/pagination';

export class FavoriteRepository implements InterfaceFavoriteRepository {
  
  async findByUserId(
    userId: string, 
    page: number, 
    limit: number
  ): Promise<PaginatedResponse<FavoriteWithProduct>> {
    const skip = (page - 1) * limit;
    
    const where = { userId };

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.favorite.count({ where }),
    ]);

    return createPaginatedResponse(
      favorites as FavoriteWithProduct[],
      total,
      page,
      limit
    );
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