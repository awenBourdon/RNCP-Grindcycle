import { PointsType } from '@/generated/prisma'

export const mockPointsHistory = {
  id: 'points-1',
  userId: 'user-1',
  usedBoardId: 'board-1',
  type: PointsType.RECYCLING,
  pointsAmount: 80,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
}

export const mockPurchasePoints = {
  id: 'points-2',
  userId: 'user-1',
  usedBoardId: null,
  type: PointsType.PURCHASE,
  pointsAmount: -450,
  createdAt: new Date('2024-01-02T10:00:00Z'),
  deletedAt: null,
}

export const mockAdjustmentPoints = {
  id: 'points-3',
  userId: 'user-1',
  usedBoardId: 'board-1',
  type: PointsType.ADJUSTMENT_RECYCLING,
  pointsAmount: 20,
  createdAt: new Date('2024-01-03T10:00:00Z'),
  deletedAt: null,
}

export const mockPointsHistoryList = [
  mockPointsHistory,
  mockPurchasePoints,
  mockAdjustmentPoints
]