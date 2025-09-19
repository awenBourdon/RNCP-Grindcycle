import { User } from '@/generated/prisma';
import { InterfaceUserRepository } from './repository/interface-users.repository';
import { UserRepository } from './repository/users.repository';
import { pointsService } from '../points/points.service';

export class UserService {
  constructor(
    private userRepository: InterfaceUserRepository = new UserRepository()
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserPointsHistory(userId: string) {
    await this.getUserById(userId);
    return await pointsService.getUserPointsHistory(userId);
  }

  async getUserPointsTotal(userId: string): Promise<number> {
    await this.getUserById(userId);
    return await pointsService.getUserPointsTotal(userId);
  }

  async recalculateUserPoints(userId: string): Promise<number> {
    await this.getUserById(userId);
    return await pointsService.recalculateUserPoints(userId);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.deleteWithOrdersAnonymization(userId);
  }

  async updateUserProfile(id: string, data: { name?: string; email?: string }): Promise<User> {
    await this.getUserById(id);
    
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Cette adresse email est déjà utilisée');
      }
    }
    
    return await this.userRepository.update(id, data);
  }
}