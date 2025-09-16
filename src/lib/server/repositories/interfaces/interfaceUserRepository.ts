import { User } from '@/generated/prisma';

export interface InterfaceUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  updatePoints(id: string, points: number): Promise<User>;
  incrementPoints(id: string, points: number): Promise<User>;
  decrementPoints(id: string, points: number): Promise<User>;
}
