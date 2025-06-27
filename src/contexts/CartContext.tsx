'use client'
import type { ProductType } from '@/lib/types'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

export type CartItemType = {
  id: number
  name: string
  price: number
  imageUrl: string
  type: string
  size: number | null
}

type CartContextType = {
  cartItems: CartItemType[]
  addToCart: (product: ProductType) => void
  removeFromCart: (product: ProductType | number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getShippingCost: () => number
  isInCart: (product: ProductType) => boolean
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  getShippingCost: () => 0,
  isInCart: () => false,
})

export const useCart = () => useContext(CartContext)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: ProductType) => {
    setCartItems((prevItems) => [
      ...prevItems,
      {
        id: product.id,
        name: product.name,
        price: product.priceEuro,
        imageUrl: product.imageUrl,
        type: product.type,
        size: product.size,
      },
    ])
  }

  const removeFromCart = (productOrId: ProductType | number) => {
    const id = typeof productOrId === 'number' ? productOrId : productOrId.id
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const getCartCount = () => {
    return cartItems.length
  }

  const getShippingCost = () => {
    const subtotal = getCartTotal()
    return subtotal >= 100 ? 0 : 9.9
  }

  const isInCart = (product: ProductType) => {
    return cartItems.some((item) => item.id === product.id)
  }

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    getShippingCost,
    isInCart,
  }

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}
