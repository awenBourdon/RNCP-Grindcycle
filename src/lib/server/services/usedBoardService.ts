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
