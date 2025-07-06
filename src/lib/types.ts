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
