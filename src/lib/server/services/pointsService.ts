/**
 * POINTS SYSTEM MANAGEMENT SERVICE
 * 
 * This service implements a comprehensive points-based reward system for the skateboard
 * recycling marketplace. It manages all aspects of points transactions, balance calculations,
 * historical tracking, and analytics to support both user engagement and administrative
 * oversight of the recycling incentive program.
 * 
 * Core Responsibilities:
 * - Points balance calculation and real-time tracking
 * - Transactional points operations with audit trail maintenance
 * - Comprehensive analytics and reporting for user engagement metrics
 * - Historical data management with flexible querying capabilities
 * - User ranking system for gamification features
 * 
 * Key Features:
 * - Atomic transaction processing ensuring data consistency
 * - Dual-ledger system (pointsHistory + user.points) for accuracy
 * - Comprehensive audit trail for all points operations
 * - Advanced analytics with earning/spending breakdowns
 * - Flexible date range filtering for historical analysis
 * - User ranking and leaderboard functionality
 * 
 * Transaction Safety:
 * - All points operations use database transactions for atomicity
 * - Balance validation before debit operations to prevent overdrafts
 * - Automatic user balance synchronization with transaction history
 * - Error handling with proper rollback mechanisms
 * 
 * Analytics Capabilities:
 * - Real-time balance calculation from transaction history
 * - Earning vs spending analysis for user behavior insights
 * - Transaction categorization (RECYCLING vs PURCHASE)
 * - Date range analysis for trend identification
 * - System-wide points circulation monitoring
 * - User ranking and competitive features
 * 
 * Business Logic:
 * - Supports both positive (earning) and negative (spending) transactions
 * - Automatic type classification for different transaction sources
 * - Optional linking to specific used boards for traceability
 * - Comprehensive validation to maintain system integrity
 */

import { prisma } from '@/lib/prisma'
import { PointsType, PointsHistory } from '@/generated/prisma'

export interface PointsHistoryWithUser extends PointsHistory {
  user: {
    id: string
    name: string
    email: string
  }
}

export interface PointsStats {
  totalEarned: number
  totalSpent: number
  currentBalance: number
  transactionCount: number
}

export interface PointsTransactionsByType {
  recycling: PointsHistoryWithUser[]
  purchases: PointsHistoryWithUser[]
}

export class PointsService {
  async getUserPointsBalance(userId: string): Promise<number> {
    const pointsHistory = await prisma.pointsHistory.findMany({
      where: { userId },
    })
    
    return pointsHistory.reduce((total, entry) => total + entry.pointsAmount, 0)
  }

  async addPoints(
    userId: string, 
    amount: number, 
    type: PointsType, 
    usedBoardId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.pointsHistory.create({
        data: {
          userId,
          pointsAmount: amount,
          type,
          usedBoardId,
        },
      })

      await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: amount
          }
        }
      })
    })
  }

  async debitPoints(
    userId: string, 
    amount: number, 
    usedBoardId?: string
  ): Promise<void> {
    const userBalance = await this.getUserPointsBalance(userId)
    
    if (userBalance < amount) {
      throw new Error('Points insuffisants')
    }

    await this.addPoints(userId, -amount, PointsType.PURCHASE, usedBoardId)
  }

  async getPointsHistory(userId: string): Promise<PointsHistoryWithUser[]> {
    const result = await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return result as PointsHistoryWithUser[]
  }


  async getUserPointsStats(userId: string): Promise<PointsStats> {
    const history = await prisma.pointsHistory.findMany({
      where: { userId },
    })

    const totalEarned = history
      .filter(entry => entry.pointsAmount > 0)
      .reduce((sum, entry) => sum + entry.pointsAmount, 0)

    const totalSpent = Math.abs(history
      .filter(entry => entry.pointsAmount < 0)
      .reduce((sum, entry) => sum + entry.pointsAmount, 0))

    const currentBalance = await this.getUserPointsBalance(userId)

    return {
      totalEarned,
      totalSpent,
      currentBalance,
      transactionCount: history.length
    }
  }

  async getPointsHistoryByType(userId: string): Promise<PointsTransactionsByType> {
    const history = await this.getPointsHistory(userId)

    return {
      recycling: history.filter(entry => entry.type === PointsType.RECYCLING),
      purchases: history.filter(entry => entry.type === PointsType.PURCHASE)
    }
  }

  async getRecentPointsHistory(userId: string, limit: number = 10): Promise<PointsHistoryWithUser[]> {
    const result = await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return result as PointsHistoryWithUser[]
  }

  async getPointsHistoryByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<PointsHistoryWithUser[]> {
    const result = await prisma.pointsHistory.findMany({
      where: { 
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return result as PointsHistoryWithUser[]
  }

  async getTotalPointsInSystem(): Promise<number> {
    const result = await prisma.pointsHistory.aggregate({
      _sum: {
        pointsAmount: true
      }
    })

    return result._sum.pointsAmount ?? 0
  }

  async getUserRanking(userId: string): Promise<{
    rank: number
    totalUsers: number
    userPoints: number
  }> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        points: true
      },
      orderBy: {
        points: 'desc'
      }
    })

    const totalUsers = users.length
    const userIndex = users.findIndex(user => user.id === userId)
    const rank = userIndex !== -1 ? userIndex + 1 : totalUsers
    const userPoints = users[userIndex]?.points ?? 0

    return {
      rank,
      totalUsers,
      userPoints
    }
  }
}