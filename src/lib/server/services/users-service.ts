import { User } from '@/generated/prisma';
import { InterfaceUserRepository } from '../repositories/interfaces/interfaceUserRepository';
import { UserRepository } from '../repositories/userRepositoty';

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

  async updateUserPoints(id: string, points: number): Promise<User> {
    await this.getUserById(id);
    return await this.userRepository.updatePoints(id, points);
  }

  async incrementUserPoints(id: string, points: number): Promise<User> {
    await this.getUserById(id);
    return await this.userRepository.incrementPoints(id, points);
  }

  async decrementUserPoints(id: string, points: number): Promise<User> {
    const user = await this.getUserById(id);
    
    if (user.points < points) {
      throw new Error('Points insuffisants');
    }
    
    return await this.userRepository.decrementPoints(id, points);
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