import { prisma } from '@/lib/utils/prisma';
import { User } from '@/generated/prisma';
import {
  InterfaceUserRepository,
  UpdateUserData
} from './interface-users.repository';
import { PaginatedResponse, createPaginatedResponse } from '@/lib/utils/pagination';

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class UserRepository implements InterfaceUserRepository {

  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      where: { deletedAt: null },
    });
  }

  async findAllWithPagination(
    page: number,
    limit: number
  ): Promise<PaginatedResponse<User>> {
    const skip = (page - 1) * limit;
    
    const where = { deletedAt: null };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { role: 'desc' },
          { createdAt: 'desc' }
        ],
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(
      users,
      total,
      page,
      limit
    );
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { 
        email,
        deletedAt: null 
      },
    });
  }

async update(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async updatePoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }

  async updatePointsInTransaction(
    tx: PrismaTransaction, 
    id: string, 
    points: number
  ): Promise<User> {
    return await tx.user.update({
      where: { id },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }

  // TODO : appeler les repositorys
 async deleteWithRelationsCleanup(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Les UsedBoards auront automatiquement userId = null grâce à onDelete: SetNull
    
    await tx.order.updateMany({
      where: { userId: id },
      data: { userId: null },
    });
    
    await tx.favorite.deleteMany({
      where: { userId: id },
    });
    
    await tx.notification.deleteMany({
      where: { userId: id },
    });
    
    await tx.session.deleteMany({
      where: { userId: id },
    });
    
    await tx.account.deleteMany({
      where: { userId: id },
    });
    
    // Maintenant on peut supprimer physiquement l'utilisateur
    await tx.user.delete({
      where: { id },
    });
  });
}
}