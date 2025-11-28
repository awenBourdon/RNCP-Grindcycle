'use client';
import type { CartItem, Product } from '@/lib/utils/types/types';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (product: Product | string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getShippingCost: () => number;
  isInCart: (product: Product) => boolean;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  getShippingCost: () => 0,
  isInCart: () => false,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const validCart = parsedCart.filter(
            item => item.id && item.name && typeof item.priceEuro === 'number'
          );
          setCartItems(validCart);
        }
      }
    } catch {
      localStorage.removeItem('cart');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch {}
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          type: product.type,
          priceEuro: product.priceEuro,
          pricePoints: product.pricePoints,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productOrId: Product | string) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;

    // Supprime seulement la première occurrence du produit
    setCartItems(prevItems => {
      const index = prevItems.findIndex(item => item.id === id);
      if (index === -1) return prevItems;

      return [...prevItems.slice(0, index), ...prevItems.slice(index + 1)];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.priceEuro, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const shippingCost = useMemo(() => {
    return cartTotal >= 100 ? 0 : 4.5;
  }, [cartTotal]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);
  const getCartCount = useCallback(() => cartCount, [cartCount]);
  const getShippingCost = useCallback(() => shippingCost, [shippingCost]);

  const isInCart = useCallback(
    (product: Product) => {
      return cartItems.some(item => item.id === product.id);
    },
    [cartItems]
  );

  const contextValue = useMemo<CartContextType>(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      getShippingCost,
      isInCart,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      getShippingCost,
      isInCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}
