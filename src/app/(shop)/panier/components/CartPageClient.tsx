'use client';
import { useCart } from '@/app/contexts/CartContext';
import { EmptyCart } from './EmptyCart';
import { Header } from './Header';
import { ItemsList } from './ItemsList';
import { Checkout } from './Checkout';

interface CartPageClientProps {
  userPoints: number;
  isAuthenticated: boolean;
}

export const CartPageClient = ({
  userPoints,
  isAuthenticated,
}: CartPageClientProps) => {
  const { cartItems } = useCart();

  return (
    <div className="min-h-screen">
      <div className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <Header />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <ItemsList />
            <div>
              <Checkout
                userPoints={userPoints}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}
      </div>
    </div>
  );
};
