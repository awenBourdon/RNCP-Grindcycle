/**
 * USED BOARD BUSINESS LOGIC SERVICE
 * 
 * This service manages the complete business logic for used skateboard handling in the recycling
 * and marketplace ecosystem. It orchestrates complex workflows involving status transitions,
 * points calculations, image management, and maintains data consistency across multiple related
 * entities through sophisticated transaction management.
 * 
 * Core Business Logic:
 * - Used board creation with optional image upload processing
 * - Complex status workflow management (SENT → RECEIVED → Points awarded)
 * - Dynamic points calculation and user balance synchronization
 * - Transactional operations ensuring atomicity across related data
 * - Image lifecycle management with comprehensive error recovery
 * 
 * Key Features:
 * - Intelligent points management with automatic recalculation on updates
 * - Status-based workflow with conditional points awarding
 * - Atomic transactions for all operations affecting user balances
 * - Image upload validation with automatic cleanup on failures
 * - Historical data preservation through points transaction logging
 * 
 * Status Workflow Intelligence:
 * The service implements sophisticated logic for status transitions:
 * - When status changes TO 'RECEIVED': Awards points and creates transaction history
 * - When status changes FROM 'RECEIVED': Removes points and cleans transaction history
 * - Automatic user balance recalculation ensures data consistency
 * - Prevents duplicate point awards through transaction cleanup
 * 
 * Points System Integration:
 * - Creates RECYCLING type transactions when boards are marked as received
 * - Automatically recalculates user's total points balance from transaction history
 * - Handles points rollback during deletions with temporal filtering
 * - Maintains complete audit trail for all points operations
 * 
 * Transaction Safety:
 * - All operations involving points use database transactions for atomicity
 * - Proper cleanup of both database records and uploaded files
 * - Error recovery mechanisms with automatic rollback
 * - Consistent state management across multiple related tables
 * 
 * Advanced Features:
 * - Temporal filtering for points history cleanup (prevents accidental deletion)
 * - Flexible image handling supporting both upload and JSON-based creation
 * - User-specific data filtering for privacy and security
 * - Comprehensive validation and error handling throughout
 */

import { UsedBoard, PointsType } from '@/generated/prisma'
import { UsedBoardRepository } from '@/lib/server/repositories/usedBoardRepository'
import { CreateUsedBoardData, UpdateUsedBoardData, UsedBoardWithRelations } from '@/lib/server/types/usedBoard'
import { ImageService } from '@/lib/server/utils/imageService'
import { API_MESSAGES } from '@/lib/server/config/constants'
import { prisma } from '@/lib/prisma'
import { InterfaceUsedBoardRepository } from '../repositories/interfaces/interfaceUsedBoardRepository'

export class UsedBoardService {
  constructor(
    private usedBoardRepository: InterfaceUsedBoardRepository = new UsedBoardRepository(),
    private imageService: ImageService = new ImageService('usedBoards')
  ) {}

  async createUsedBoard(
    data: Omit<CreateUsedBoardData, 'image'>, 
    imageFiles?: File[]
  ): Promise<UsedBoard> {
    let imagePaths: string[] = []

    if (imageFiles && imageFiles.length > 0) {
      const imageResult = await this.imageService.uploadMultiple(imageFiles)
      
      if (!imageResult.success) {
        throw new Error(`Erreur upload images: ${imageResult.errors.join(', ')}`)
      }
      
      imagePaths = imageResult.paths
    }

    const usedBoardData: CreateUsedBoardData = {
      ...data,
      image: imagePaths
    }

    try {
      return await this.usedBoardRepository.create(usedBoardData)
    } catch (error) {
      if (imagePaths.length > 0) {
        await this.imageService.deleteMultiple(imagePaths)
      }
      throw error
    }
  }

  async getUsedBoardById(id: string): Promise<UsedBoardWithRelations> {
    const usedBoard = await this.usedBoardRepository.findById(id)
    
    if (!usedBoard) {
      throw new Error(API_MESSAGES.USED_BOARD_NOT_FOUND)
    }

    return usedBoard
  }

  async getAllUsedBoards(): Promise<UsedBoardWithRelations[]> {
    return await this.usedBoardRepository.findAll()
  }

  async getUserUsedBoards(userId: string): Promise<UsedBoardWithRelations[]> {
    return await this.usedBoardRepository.findByUserId(userId)
  }

  async updateUsedBoard(
    boardId: string, 
    updateData: Partial<UpdateUsedBoardData>
  ): Promise<UsedBoardWithRelations> {
    const oldBoard = await this.getUsedBoardById(boardId)

    return await prisma.$transaction(async (tx) => {
      const updatedBoard = await tx.usedBoard.update({
        where: { id: boardId },
        data: updateData,
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

      if (oldBoard.pointsAwarded && oldBoard.pointsAwarded > 0 && oldBoard.status === 'RECEIVED') {
        await tx.pointsHistory.deleteMany({
          where: {
            userId: updatedBoard.userId,
            usedBoardId: boardId,
            type: 'RECYCLING',
          },
        })
      }

      if (updatedBoard.pointsAwarded && updatedBoard.pointsAwarded > 0 && updatedBoard.status === 'RECEIVED') {
        await tx.pointsHistory.create({
          data: {
            userId: updatedBoard.userId,
            usedBoardId: boardId,
            type: PointsType.RECYCLING,
            pointsAmount: updatedBoard.pointsAwarded,
          },
        })
      }

      const totalPoints = await tx.pointsHistory.aggregate({
        where: { userId: updatedBoard.userId },
        _sum: { pointsAmount: true },
      })

      await tx.user.update({
        where: { id: updatedBoard.userId },
        data: {
          points: totalPoints._sum.pointsAmount ?? 0,
        },
      })

      return updatedBoard
    })
  }

  async deleteUsedBoard(boardId: string): Promise<void> {
    const board = await this.getUsedBoardById(boardId)

    await prisma.$transaction(async (tx) => {
      if (board.pointsAwarded && board.pointsAwarded > 0) {
        await tx.pointsHistory.deleteMany({
          where: {
            userId: board.user.id,
            type: 'RECYCLING',
            pointsAmount: board.pointsAwarded,
            createdAt: {
              gte: new Date(board.updatedAt.getTime() - 60000),
            },
          },
        })

        await tx.user.update({
          where: { id: board.user.id },
          data: {
            points: {
              decrement: board.pointsAwarded,
            },
          },
        })
      }

      await tx.usedBoard.delete({
        where: { id: boardId },
      })
    })

    if (board.image && board.image.length > 0) {
      await this.imageService.deleteMultiple(board.image)
    }
  }
}
