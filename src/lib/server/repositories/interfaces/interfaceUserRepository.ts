import { User } from '@/generated/prisma';

export interface InterfaceUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePoints(id: string, points: number): Promise<User>;
  incrementPoints(id: string, points: number): Promise<User>;
  decrementPoints(id: string, points: number): Promise<User>;
  delete(id: string): Promise<void>;
  update(id: string, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User>;
  deleteWithOrdersAnonymization(id: string): Promise<void>;
}