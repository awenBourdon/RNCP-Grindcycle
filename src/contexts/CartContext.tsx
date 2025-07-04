'use client'
import type { CartItemType, ProductType } from '@/lib/types'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type CartContextType = {
  cartItems: CartItemType[]
  addToCart: (product: ProductType) => void
  removeFromCart: (product: ProductType | string) => void // string au lieu de number
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
        type: product.type,
        priceEuro: product.priceEuro,
        quantity: 1,
        imageUrl: product.imageUrl,
      },
    ])
  }

  const removeFromCart = (productOrId: ProductType | string) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.priceEuro * item.quantity,
      0
    )
  }

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
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
