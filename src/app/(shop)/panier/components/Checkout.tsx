'use client';
import type React from 'react';
import { useState } from 'react';
import { useCart } from '@/app/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Coins, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';

interface CheckoutProps {
  userPoints: number;
  isAuthenticated: boolean;
}

export const Checkout = ({ userPoints, isAuthenticated }: CheckoutProps) => {
  const { cartItems } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'EURO' | 'POINTS'>('EURO');
  const router = useRouter();

  const totalPoints = cartItems.reduce((total, item) => {
    return total + item.priceEuro * item.quantity;
  }, 0);

  const canPayWithPoints = isAuthenticated && userPoints >= totalPoints;

  const handlePurchaseWithPoints = () => {
    if (!isAuthenticated) {
      toast.error('Tu dois être connecté pour utiliser tes points');
      router.push('/authentification/connexion');
      return;
    }
    if (!canPayWithPoints) {
      toast.error(
        `Points insuffisants. Tu as ${userPoints} points, ${totalPoints} requis.`
      );
      return;
    }
    router.push('/paiement/echange/livraison');
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-[#010101] mb-6">Récapitulatif</h3>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-[#010101]">
          Méthode de paiement
        </h4>
        <div className="space-y-3">
          <label className="flex items-center p-4 bg-[#f8f7f4] rounded-xl cursor-pointer transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="EURO"
              checked={paymentMethod === 'EURO'}
              onChange={e =>
                setPaymentMethod(e.target.value as 'EURO' | 'POINTS')
              }
              className="mr-3"
            />
            <CreditCard size={20} className="mr-3 text-[#0a3d3f]" />
            <div>
              <p className="font-medium text-[#010101]">Paiement par carte</p>
              <p className="text-sm text-gray-600">
                Total:{' '}
                {cartItems
                  .reduce(
                    (total, item) => total + item.priceEuro * item.quantity,
                    0
                  )
                  .toFixed(2)}
                €
              </p>
            </div>
          </label>

          <label
            className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
              canPayWithPoints
                ? 'bg-[#f8f7f4]'
                : 'opacity-50 cursor-not-allowed bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="POINTS"
              checked={paymentMethod === 'POINTS'}
              onChange={e =>
                setPaymentMethod(e.target.value as 'EURO' | 'POINTS')
              }
              disabled={!canPayWithPoints}
              className="mr-3"
            />
            <Coins size={20} className="mr-3 text-[#0a3d3f]" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[#010101]">
                  Payer avec mes points
                </p>
                <span className="text-sm text-gray-600">
                  {userPoints} / {totalPoints} points
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {canPayWithPoints
                  ? `Livraison offerte • Total: ${totalPoints} points`
                  : `Points insuffisants • Il te manque ${totalPoints - userPoints} points`}
              </p>
            </div>
          </label>
        </div>

        {!isAuthenticated && (
          <div className="p-4 bg-[#f8f7f4] rounded-xl">
            <p className="text-sm text-gray-700">
              <strong className="text-[#0A3D3F]">
                <Link href="/authentification/connexion">Connecte-toi</Link>
              </strong>{' '}
              pour utiliser tes points ou voir ton solde
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {paymentMethod === 'POINTS' ? (
          <button
            onClick={handlePurchaseWithPoints}
            disabled={!canPayWithPoints}
            className={`w-full py-4 px-6 rounded-full font-medium transition-colors flex items-center justify-center ${
              canPayWithPoints
                ? 'bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Truck size={20} className="mr-2" />
            Continuer avec les points
          </button>
        ) : (
          <button
            onClick={() => router.push('/panier/redirect')}
            className="w-full py-4 px-6 bg-[#0a3d3f] text-white rounded-full font-medium hover:bg-[#0a4d4f] transition-colors flex items-center justify-center cursor-pointer"
          >
            <CreditCard size={20} className="mr-2" />
            Payer par carte
          </button>
        )}
      </div>
    </div>
  );
};
