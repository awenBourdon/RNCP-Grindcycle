import { UsedBoard, BoardType, BoardCondition, UsedBoardStatus, ProductStatus } from '@/generated/prisma'

export interface CreateUsedBoardData {
  name: string
  userId: string
  boardType: BoardType
  boardCondition: BoardCondition
  description?: string
  image: string[]
  status?: UsedBoardStatus
  pointsAwarded?: number
}

export interface UpdateUsedBoardData {
  name?: string
  boardType?: BoardType
  boardCondition?: BoardCondition
  description?: string
  image?: string[]
  status?: UsedBoardStatus
  pointsAwarded?: number
}

export interface UsedBoardFilters {
  userId?: string
  status?: UsedBoardStatus[]
  boardType?: BoardType[]
  boardCondition?: BoardCondition[]
  hasProduct?: boolean
  search?: string
}

export interface UsedBoardWithRelations extends UsedBoard {
  user: {
    id: string
    name: string
    email: string
  }
  product?: {
    id: string
    name: string
    status: ProductStatus
  } | null
}

export interface UsedBoardCreateRequest {
  name: string
  userId: string
  boardType: string
  boardCondition: string
  description?: string
  images: File[]
}

export interface UsedBoardUpdateRequest {
  boardId: string
  status?: UsedBoardStatus
  pointsAwarded?: number
  boardCondition?: BoardCondition
  description?: string
}