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
            item =>
              item.id &&
              item.name &&
              typeof item.priceEuro === 'number' &&
              typeof item.quantity === 'number' &&
              item.quantity > 0
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
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          type: product.type,
          priceEuro: product.priceEuro,
          pricePoints: product.pricePoints,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productOrId: Product | string) => {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.priceEuro * item.quantity,
      0
    );
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
