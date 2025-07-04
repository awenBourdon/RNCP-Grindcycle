/**
 * USER MANAGEMENT SERVICE
 * 
 * This service provides a lightweight business logic layer for user management operations,
 * focusing primarily on user retrieval and points balance management. It serves as a simple
 * orchestration layer between controllers and the UserRepository, adding essential validation
 * and business rule enforcement for user-related operations.
 * 
 * Core Responsibilities:
 * - User existence validation and retrieval
 * - Points balance management with business rule enforcement
 * - Input validation and error handling for user operations
 * - Abstraction layer over repository for consistent user access patterns
 * 
 * Key Features:
 * - Automatic user existence validation before all operations
 * - Points balance validation to prevent negative balances
 * - Consistent error messaging using centralized constants
 * - Clean separation between service logic and data access
 * 
 * Business Rules:
 * - Users must exist before any points operations can be performed
 * - Points cannot be decremented below zero (insufficient funds protection)
 * - All points operations are atomic at the repository level
 * - Consistent error handling with meaningful error messages
 * 
 * Design Philosophy:
 * - Intentionally lightweight service focusing on essential user operations
 * - Complex points logic is handled by dedicated PointsService
 * - Follows single responsibility principle for maintainable code
 * - Provides foundation for future user management feature expansion
 * 
 * Integration Context:
 * - Used by controllers for basic user operations
 * - Complements PointsService for comprehensive points management
 * - Repository pattern implementation for clean data access
 * - Suitable for dependency injection and unit testing
 * 
 * Future Extensibility:
 * - Can be extended with user profile management
 * - Ready for authentication and authorization integration
 * - Structured for additional user-related business logic
 * - Maintains clean interface for controller integration
 */

import { User } from '@/generated/prisma'
import { UserRepository } from '@/lib/server/repositories/userRepositoty';
import { API_MESSAGES } from '@/lib/server/config/constants'
import { InterfaceUserRepository } from '../repositories/interfaces/interfaceUserRepository';

export class UserService {
  constructor(
    private userRepository: InterfaceUserRepository = new UserRepository()
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    
    if (!user) {
      throw new Error(API_MESSAGES.USER_NOT_FOUND)
    }

    return user
  }

  async updateUserPoints(id: string, points: number): Promise<User> {
    await this.getUserById(id)
    
    return await this.userRepository.updatePoints(id, points)
  }

  async incrementUserPoints(id: string, points: number): Promise<User> {
    await this.getUserById(id)
    
    return await this.userRepository.incrementPoints(id, points)
  }

  async decrementUserPoints(id: string, points: number): Promise<User> {
    const user = await this.getUserById(id)
    
    if (user.points < points) {
      throw new Error(API_MESSAGES.INSUFFICIENT_POINTS)
    }
    
    return await this.userRepository.decrementPoints(id, points)
  }
}