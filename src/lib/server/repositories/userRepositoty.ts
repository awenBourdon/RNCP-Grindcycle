/**
 * USER DATA ACCESS LAYER REPOSITORY
 * 
 * This repository provides a focused data access layer for user management, specifically
 * designed around the points system functionality in the skateboard recycling marketplace.
 * It implements essential user operations while maintaining simplicity and performance
 * through targeted database interactions.
 * 
 * Core Responsibilities:
 * - Basic user retrieval operations by unique identifier
 * - Points balance management with atomic database operations
 * - Safe increment/decrement operations for points transactions
 * - Direct points value updates for administrative corrections
 * 
 * Key Features:
 * - Atomic points operations using Prisma's increment/decrement features
 * - Clean separation of concerns focusing solely on user data management
 * - Type-safe database operations with full Prisma integration
 * - Minimal interface implementation for specific business needs
 * 
 * Points System Integration:
 * - updatePoints(): Direct points balance setting (admin corrections)
 * - incrementPoints(): Safe addition for earning points (recycling rewards)
 * - decrementPoints(): Safe subtraction for spending points (purchases)
 * - All operations are atomic at the database level for consistency
 * 
 * Design Philosophy:
 * - Intentionally lightweight repository focusing on core user operations
 * - Points management is handled through dedicated PointsService for complex logic
 * - Simple interface suitable for dependency injection and testing
 * - Follows single responsibility principle for maintainable code
 * 
 * Usage Context:
 * - Used primarily by UserService for business logic coordination
 * - Integrated with points system for balance updates
 * - Supports both direct operations and service-layer abstractions
 */

import { prisma } from '@/lib/prisma'
import { User } from '@/generated/prisma'
import { InterfaceUserRepository } from './interfaces/interfaceUserRepository'

export class UserRepository implements InterfaceUserRepository {
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  async updatePoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: { points }
    })
  }

  async incrementPoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        points: {
          increment: points
        }
      }
    })
  }

  async decrementPoints(id: string, points: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        points: {
          decrement: points
        }
      }
    })
  }
}