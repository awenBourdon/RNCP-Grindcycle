'use client';
import type React from 'react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
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
    return total + item.pricePoints;
  }, 0);

  const totalEuro = cartItems.reduce((total, item) => {
    return total + item.priceEuro;
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
    <div
      className="space-y-6"
      aria-label="Formulaire de paiement et récapitulatif de commande"
    >
      <h3 className="text-xl font-medium text-[#010101] mb-6">Récapitulatif</h3>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-[#010101]">
          Méthode de paiement
        </h4>
        <div
          className="space-y-3"
          role="group"
          aria-label="Sélectionner une méthode de paiement"
        >
          <label
            className="flex items-center p-4 bg-[#f8f7f4] rounded-xl cursor-pointer transition-colors"
            aria-label={`Payer par carte bancaire, total ${totalEuro.toFixed(2)} euros`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="EURO"
              checked={paymentMethod === 'EURO'}
              onChange={e =>
                setPaymentMethod(e.target.value as 'EURO' | 'POINTS')
              }
              className="mr-3"
              aria-label="Sélectionner le paiement par carte"
            />
            <CreditCard
              size={20}
              className="mr-3 text-[#0a3d3f]"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-[#010101]">Paiement par carte</p>
              <p className="text-sm text-gray-600">
                Total: {totalEuro.toFixed(2)}€
              </p>
            </div>
          </label>

          <label
            className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
              canPayWithPoints
                ? 'bg-[#f8f7f4]'
                : 'opacity-50 cursor-not-allowed bg-gray-50'
            }`}
            aria-label={`Payer avec mes points${canPayWithPoints ? ` (${userPoints} points disponibles, ${totalPoints} requis)` : ' - points insuffisants'}`}
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
              aria-label="Sélectionner le paiement par points"
            />
            <Coins
              size={20}
              className="mr-3 text-[#0a3d3f]"
              aria-hidden="true"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[#010101]">
                  Payer avec mes points
                </p>
                <span
                  className="text-sm text-gray-600"
                  aria-label={`Points disponibles : ${userPoints} sur ${totalPoints} requis`}
                >
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
          <div
            className="p-4 bg-[#f8f7f4] rounded-xl"
            role="alert"
            aria-label="Vous devez vous connecter pour utiliser les points"
          >
            <p className="text-sm text-gray-700">
              <strong className="text-[#0A3D3F]">
                <Link
                  href="/authentification/connexion"
                  aria-label="Se connecter pour utiliser les points"
                >
                  Connecte-toi
                </Link>
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
            aria-label={
              canPayWithPoints
                ? `Continuer le paiement avec ${totalPoints} points`
                : `Paiement avec points désactivé - points insuffisants`
            }
          >
            <Truck size={20} className="mr-2" aria-hidden="true" />
            Continuer avec les points
          </button>
        ) : (
          <button
            onClick={() => router.push('/panier/redirect')}
            className="w-full py-4 px-6 bg-[#0a3d3f] text-white rounded-full font-medium hover:bg-[#0a4d4f] transition-colors flex items-center justify-center cursor-pointer"
            aria-label={`Payer par carte`}
          >
            <CreditCard size={20} className="mr-2" aria-hidden="true" />
            Payer par carte
          </button>
        )}
      </div>
    </div>
  );
};
