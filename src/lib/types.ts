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
