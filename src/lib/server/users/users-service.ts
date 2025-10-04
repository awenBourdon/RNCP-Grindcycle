import { User } from '@/generated/prisma';
import {
  InterfaceUserRepository,
  UpdateUserData
} from './repository/interface-users.repository';
import { UserRepository } from './repository/users.repository';
import { PaginatedResponse, PaginationParams, normalizePaginationParams } from '@/lib/utils/pagination';

export class UserService {
  constructor(
    private userRepository: InterfaceUserRepository = new UserRepository()
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getAllUsersWithPagination(
    params: PaginationParams
  ): Promise<PaginatedResponse<User>> {
    const { page, limit } = normalizePaginationParams(params);
    return await this.userRepository.findAllWithPagination(page, limit);
  }

  async getUserById(userId: string): Promise<User> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    if (!email) {
      throw new Error('Email requis');
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

 async updateUserProfile(userId: string, data: UpdateUserData): Promise<User> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    await this.getUserById(userId);
    
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Cette adresse email est déjà utilisée');
      }
    }

    this.validateUpdateData(data);
    
    return await this.userRepository.update(userId, data);
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    if (typeof points !== 'number' || isNaN(points)) {
      throw new Error('Différence de points invalide');
    }

    const user = await this.getUserById(userId);

    if (user.points + points < 0) {
      throw new Error('Solde de points insuffisant');
    }

    return await this.userRepository.updatePoints(userId, points);
  }

  async getUserPoints(userId: string): Promise<number> {
    const user = await this.getUserById(userId);
    return user.points;
  }

  async deleteUser(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    await this.getUserById(userId);

    await this.userRepository.deleteWithRelationsCleanup(userId);
  }

  getRepository(): InterfaceUserRepository {
    return this.userRepository;
  }


  private validateUpdateData(data: UpdateUserData): void {
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error('Le nom ne peut pas être vide');
      }
      if (data.name.length > 100) {
        throw new Error('Le nom ne peut pas dépasser 100 caractères');
      }
    }

    if (data.email !== undefined) {
      if (typeof data.email !== 'string' || !this.isValidEmail(data.email)) {
        throw new Error('Format d\'email invalide');
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}