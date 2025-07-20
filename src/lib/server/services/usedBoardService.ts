import { UsedBoard, PointsType } from '@/generated/prisma'
import { UsedBoardRepository } from '@/lib/server/repositories/usedBoardRepository'
import { CreateUsedBoardData, UpdateUsedBoardData, UsedBoardWithRelations } from '@/lib/server/types/usedBoard'
import { ImageService } from '@/lib/server/utils/imageService'
import { API_MESSAGES } from '@/lib/server/config/constants'
import { prisma } from '@/lib/prisma'
import { InterfaceUsedBoardRepository } from '../repositories/interfaces/interfaceUsedBoardRepository'
import { createNotification, NotificationTemplates } from './notificationsService'

type PrismaTransaction = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

type UpdatedBoardWithRelations = UsedBoard & {
  user: {
    id: string
    name: string | null
    email: string
  }
  product: {
    id: string
    name: string
    status: string
  } | null
}

export class UsedBoardService {
  constructor(
    private usedBoardRepository: InterfaceUsedBoardRepository = new UsedBoardRepository(),
    private imageService: ImageService = new ImageService('usedBoards')
  ) {}

  async createUsedBoard(
    data: Omit<CreateUsedBoardData, 'image'>, 
    imageFiles?: File[]
  ): Promise<UsedBoard> {
    let imageurls: string[] = []

    if (imageFiles && imageFiles.length > 0) {
      const imageResult = await this.imageService.uploadMultiple(imageFiles)
      
      if (!imageResult.success) {
        throw new Error(`Erreur upload images: ${imageResult.errors.join(', ')}`)
      }
      
      imageurls = imageResult.urls
    }

    const usedBoardData: CreateUsedBoardData = {
      ...data,
      image: imageurls
    }

    try {
      const board = await this.usedBoardRepository.create(usedBoardData)
      await this.createBoardSubmissionNotifications(board)
      return board
    } catch (error) {
      if (imageurls.length > 0) {
        await this.imageService.deleteMultiple(imageurls)
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

    return await prisma.$transaction(async (tx: PrismaTransaction) => {
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

      const statusChanged = oldBoard.status !== updatedBoard.status
      const pointsEligibleStatuses = ['RECEIVED', 'RECYCLED_TO_PRODUCT', 'SOLD']
      const noPointsStatuses = ['PENDING_VALIDATION', 'VALIDATED', 'REJECTED', 'SENT']
      
      if (statusChanged) {
        if (pointsEligibleStatuses.includes(updatedBoard.status) && 
            !pointsEligibleStatuses.includes(oldBoard.status)) {
          await this.awardPoints(tx, updatedBoard, oldBoard, boardId)
        }
        
        else if (noPointsStatuses.includes(updatedBoard.status)) {
          await this.removePoints(tx, updatedBoard, boardId)
        }
        
        await this.recalculateUserPoints(tx, updatedBoard.userId)
        await this.createStatusChangeNotification(updatedBoard)
      }
      
      else if (updateData.pointsAwarded !== undefined && 
               pointsEligibleStatuses.includes(updatedBoard.status)) {
        await this.updatePointsOnly(tx, updatedBoard, boardId)
      }

      return updatedBoard
    })
  }

  async deleteUsedBoard(boardId: string): Promise<void> {
    const board = await this.getUsedBoardById(boardId)

    await prisma.$transaction(async (tx: PrismaTransaction) => {
      if (board.pointsAwarded && board.pointsAwarded > 0) {
        await tx.pointsHistory.deleteMany({
          where: {
            userId: board.user.id,
            usedBoardId: boardId,
            type: 'RECYCLING',
          },
        })
      }

      await tx.usedBoard.delete({
        where: { id: boardId },
      })
      
      await this.recalculateUserPoints(tx, board.user.id)
    })

    if (board.image && board.image.length > 0) {
      await this.imageService.deleteMultiple(board.image)
    }
  }

  private async awardPoints(
    tx: PrismaTransaction, 
    updatedBoard: UpdatedBoardWithRelations, 
    oldBoard: UsedBoardWithRelations, 
    boardId: string
  ): Promise<void> {
    const existingTransaction = await tx.pointsHistory.findFirst({
      where: {
        userId: updatedBoard.userId,
        usedBoardId: boardId,
        type: 'RECYCLING',
      }
    })

    const pointsToAward = updatedBoard.pointsAwarded || oldBoard.pointsAwarded || 50

    if (!existingTransaction && pointsToAward > 0) {
      if (!updatedBoard.pointsAwarded && pointsToAward > 0) {
        await tx.usedBoard.update({
          where: { id: boardId },
          data: { pointsAwarded: pointsToAward }
        })
      }
      
      await tx.pointsHistory.create({
        data: {
          userId: updatedBoard.userId,
          usedBoardId: boardId,
          type: PointsType.RECYCLING,
          pointsAmount: pointsToAward,
        },
      })
    }
  }

  private async removePoints(
    tx: PrismaTransaction, 
    updatedBoard: UpdatedBoardWithRelations, 
    boardId: string
  ): Promise<void> {
    await tx.pointsHistory.deleteMany({
      where: {
        userId: updatedBoard.userId,
        usedBoardId: boardId,
        type: 'RECYCLING',
      },
    })

    await tx.usedBoard.update({
      where: { id: boardId },
      data: { pointsAwarded: 0 }
    })
  }

  private async updatePointsOnly(
    tx: PrismaTransaction, 
    updatedBoard: UpdatedBoardWithRelations, 
    boardId: string
  ): Promise<void> {
    await tx.pointsHistory.deleteMany({
      where: {
        userId: updatedBoard.userId,
        usedBoardId: boardId,
        type: 'RECYCLING',
      },
    })
    
    if (updatedBoard.pointsAwarded && updatedBoard.pointsAwarded > 0) {
      await tx.pointsHistory.create({
        data: {
          userId: updatedBoard.userId,
          usedBoardId: boardId,
          type: PointsType.RECYCLING,
          pointsAmount: updatedBoard.pointsAwarded,
        },
      })
    }
    
    await this.recalculateUserPoints(tx, updatedBoard.userId)
  }

  private async recalculateUserPoints(tx: PrismaTransaction, userId: string): Promise<void> {
    const totalPoints = await tx.pointsHistory.aggregate({
      where: { userId },
      _sum: { pointsAmount: true },
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        points: totalPoints._sum.pointsAmount ?? 0,
      },
    })
  }

  private async createBoardSubmissionNotifications(board: UsedBoard): Promise<void> {
    try {
      await createNotification({
        userId: board.userId,
        target: 'USER',
        description: NotificationTemplates.boardSubmitted(board.name)
      })

      const user = await prisma.user.findUnique({ 
        where: { id: board.userId },
        select: { name: true }
      })
      
      if (user) {
        await createNotification({
          userId: null,
          target: 'ADMIN',
          description: NotificationTemplates.newBoardSubmitted(user.name || 'Utilisateur', board.name)
        })
      }
    } catch (error) {
      console.error('Erreur notifications création:', error)
    }
  }

  private async createStatusChangeNotification(
    board: UpdatedBoardWithRelations
  ): Promise<void> {
    try {
      let notificationDescription = ''

      switch (board.status) {
        case 'VALIDATED':
          notificationDescription = NotificationTemplates.boardValidated(board.name)
          break

        case 'SENT':
          notificationDescription = NotificationTemplates.boardSent(board.name)
          break

        case 'RECEIVED':
          notificationDescription = NotificationTemplates.boardReceived(board.name, board.pointsAwarded || 0)
          break

        case 'REJECTED':
          notificationDescription = NotificationTemplates.boardRejected(board.name)
          break

        case 'RECYCLED_TO_PRODUCT':
          if (board.product) {
            notificationDescription = NotificationTemplates.boardRecycled(board.name, board.product.name)
          } else {
            notificationDescription = NotificationTemplates.boardRecycled(board.name, 'nouveau produit')
          }
          break

        case 'SOLD':
          notificationDescription = NotificationTemplates.boardSold(board.name, board.pointsAwarded || 0)
          break

        default:
          return
      }

      if (notificationDescription) {
        await createNotification({
          userId: board.userId,
          target: 'USER',
          description: notificationDescription
        })
      }
    } catch (error) {
      console.error('Erreur notification changement statut:', error)
    }
  }
}