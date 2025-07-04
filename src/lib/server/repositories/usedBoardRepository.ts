/**
 * USED BOARD DATA ACCESS LAYER REPOSITORY
 * 
 * This repository handles all database operations for used skateboard management in the
 * recycling system. It provides a clean abstraction over Prisma ORM for used board
 * entities, supporting complex filtering scenarios and maintaining optimal query performance
 * through strategic relation loading and proper data structuring.
 * 
 * Core Responsibilities:
 * - CRUD operations for used boards with comprehensive relation loading
 * - Advanced filtering system supporting multiple criteria combinations
 * - User-specific board retrieval for personal dashboard functionality
 * - Status-based queries for admin workflow management
 * - Product relationship tracking for marketplace integration
 * 
 * Key Features:
 * - Multi-dimensional filtering (status, type, condition, ownership)
 * - Product conversion tracking (boards that became marketplace products)
 * - Case-insensitive search across name and description fields
 * - User isolation for privacy and security compliance
 * - Flexible status workflow support for admin processing
 * 
 * Advanced Filtering Capabilities:
 * - Status filtering for workflow management (SENT, RECEIVED, etc.)
 * - Board type categorization (skateboard, longboard, etc.)
 * - Condition-based filtering (good, average, bad)
 * - Product relationship queries (converted vs unconverted boards)
 * - User-specific filtering for personal account management
 * 
 * Data Relations:
 * - Used boards belong to users (submission ownership)
 * - Optional product relationship (when converted to marketplace item)
 * - Consistent relation loading with optimized select patterns
 * - Chronological ordering for logical data presentation
 */

import { prisma } from '@/lib/prisma'
import { UsedBoard } from '@/generated/prisma'
import { CreateUsedBoardData, UpdateUsedBoardData, UsedBoardFilters, UsedBoardWithRelations } from '@/lib/server/types/usedBoard'
import { InterfaceUsedBoardRepository } from './interfaces/interfaceUsedBoardRepository'

export class UsedBoardRepository implements InterfaceUsedBoardRepository {
  async create(data: CreateUsedBoardData): Promise<UsedBoard> {
    return await prisma.usedBoard.create({
      data: {
        userId: data.userId,
        name: data.name,
        boardCondition: data.boardCondition,
        boardType: data.boardType,
        description: data.description || null,
        image: data.image,
        status: data.status || 'SENT',
        pointsAwarded: data.pointsAwarded || null,
      },
    })
  }

  async findById(id: string): Promise<UsedBoardWithRelations | null> {
    return await prisma.usedBoard.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })
  }

  async findAll(filters?: UsedBoardFilters): Promise<UsedBoardWithRelations[]> {
    const where: Record<string, unknown> = {}

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status }
    }

    if (filters?.boardType && filters.boardType.length > 0) {
      where.boardType = { in: filters.boardType }
    }

    if (filters?.boardCondition && filters.boardCondition.length > 0) {
      where.boardCondition = { in: filters.boardCondition }
    }

    if (filters?.hasProduct !== undefined) {
      where.product = filters.hasProduct ? { isNot: null } : { is: null }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return await prisma.usedBoard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async update(id: string, data: Partial<UpdateUsedBoardData>): Promise<UsedBoardWithRelations> {
    return await prisma.usedBoard.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.usedBoard.delete({
      where: { id }
    })
  }

  async findByUserId(userId: string): Promise<UsedBoardWithRelations[]> {
    return this.findAll({ userId })
  }
}
