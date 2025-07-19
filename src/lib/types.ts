import { UsedBoardStatus } from "@/generated/prisma"

export interface ProductType {
  id: string
  name: string
  description?: string
  type: string
  priceEuro: number
  pricePoints: number
  imageUrl: string[]
  status: string
  usedBoard?: {
    id: string
    name: string
    boardType: string
  }
}

export type CartItemType = {
  id: string
  name: string
  type: string
  size?: number
  priceEuro: number
  quantity: number
  imageUrl: string[]
}

export interface ErrorContext {
  error: {
    message: string
  }
}

export interface Notification {
  id: string
  description?: string
  isRead: boolean
  createdAt?: string | Date
}

export interface User {
  id: string
  name?: string
  email: string
  role: UserRole
  createdAt: Date
}

export type UserRole = 'ADMIN' | 'USER';

export interface AdminNotification {
  id: string
  description: string
  isRead: boolean
  createdAt: string | Date
  user?: {
    id: string
    name: string | null
    email: string
  } | null
}

export enum BoardType {
  SKATE = 'SKATE',
  CRUISER = 'CRUISER',
  LONG = 'LONG',
}

export enum BoardCondition {
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  BAD = 'BAD',
}

export interface UsedBoard {
  id: string
  name: string | null
  image: string[]
  description: string | null
  createdAt: Date
  status: UsedBoardStatus
  pointsAwarded: number | null
}

export interface Session {
  user: User
}