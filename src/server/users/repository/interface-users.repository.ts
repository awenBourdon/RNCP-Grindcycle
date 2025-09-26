import { User } from '@/generated/prisma';

export interface UpdateUserData {
  name?: string;
  email?: string;
}

type PrismaTransaction = Parameters<Parameters<typeof import('@/lib/utils/prisma').prisma.$transaction>[0]>[0];

export interface InterfaceUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserData): Promise<User>;
  updatePoints(id: string, points: number): Promise<User>;
  updatePointsInTransaction(tx: PrismaTransaction, id: string, points: number): Promise<User>;
  deleteWithRelationsCleanup(id: string): Promise<void>;
}