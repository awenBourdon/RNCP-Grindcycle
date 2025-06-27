export type ProductType = {
  imageUrl: string
  id: number
  name: string
  description: string
  type: 'skate' | 'cruiser' | 'long'
  size: number | null
  priceEuro: number
  pricePoints: number
}

export type CartItemType = {
  id: string
  name: string
  type: string
  size?: number
  priceEuro: number
  quantity: number
  imageUrl?: string
}

export interface ErrorContext {
  error: {
    message: string
  }
}
