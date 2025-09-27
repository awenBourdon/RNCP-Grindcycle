import { UsedBoardStatus, BoardType, BoardCondition } from '@/generated/prisma'

export const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com'
}

export const mockUsedBoard = {
  id: 'board-1',
  name: 'Ma vieille planche',
  userId: 'user-1',
  status: UsedBoardStatus.PENDING_VALIDATION,
  boardType: BoardType.SKATE,
  boardCondition: BoardCondition.GOOD,
  description: 'Planche en bon état',
  image: ['board1.jpg'],
  pointsAwarded: 0,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  deletedAt: null,
  user: mockUser,
  product: null
}

export const mockValidatedBoard = {
  ...mockUsedBoard,
  status: UsedBoardStatus.VALIDATED
}

export const mockReceivedBoard = {
  ...mockUsedBoard,
  status: UsedBoardStatus.RECEIVED,
  pointsAwarded: 80
}

export const mockCreateUsedBoardData = {
  name: 'Nouvelle planche à recycler',
  userId: 'user-1',
  boardType: BoardType.CRUISER,
  boardCondition: BoardCondition.AVERAGE,
  description: 'Planche à recycler'
}