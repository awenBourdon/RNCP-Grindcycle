'use client';

import type React from 'react';

import { useState, useTransition } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Coins, CreditCard, Truck, MapPin } from 'lucide-react';
import { purchaseWithPointsAction } from '@/actions/orders/purchase-with-points';

interface CheckoutWithPointsProps {
  userPoints: number;
  isAuthenticated: boolean;
}

export const CheckoutWithPoints = ({
  userPoints,
  isAuthenticated,
}: CheckoutWithPointsProps) => {
  const { cartItems, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState<'EURO' | 'POINTS'>('EURO');
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
  });
  const router = useRouter();

  const totalPoints = cartItems.reduce((total, item) => {
    return total + item.priceEuro * item.quantity;
  }, 0);

  const canPayWithPoints = isAuthenticated && userPoints >= totalPoints;

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePurchaseWithPoints = () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour utiliser vos points');
      router.push('/authentification/connexion');
      return;
    }
    if (!canPayWithPoints) {
      toast.error(
        `Points insuffisants. Vous avez ${userPoints} points, ${totalPoints} requis.`
      );
      return;
    }
    setShowShippingForm(true);
  };

  const handleConfirmPurchase = () => {
    if (
      !shippingData.address ||
      !shippingData.city ||
      !shippingData.postalCode
    ) {
      toast.error('Veuillez remplir tous les champs obligatoires de livraison');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        const cartItemsForPurchase = cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          type: item.type,
          priceEuro: item.priceEuro,
          pricePoints: Math.round(item.priceEuro * 10),
          quantity: item.quantity,
        }));

        formData.append('cartItems', JSON.stringify(cartItemsForPurchase));
        formData.append('shippingAddress', JSON.stringify(shippingData));

        const result = await purchaseWithPointsAction(formData);

        if (result.success) {
          toast.success(result.message);
          clearCart();
          router.push(
            `/compte/commandes?success=true&orderId=${result.data?.orderId}`
          );
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erreur achat:', error);
        toast.error('Une erreur est survenue lors de la commande');
      }
    });
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
          <label className="flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
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
            className={`flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer transition-colors ${
              canPayWithPoints
                ? 'hover:border-gray-300'
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
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    canPayWithPoints
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {userPoints} / {totalPoints} points
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {canPayWithPoints
                  ? `Livraison gratuite • Total: ${totalPoints} points`
                  : `Points insuffisants • Il vous manque ${totalPoints - userPoints} points`}
              </p>
            </div>
          </label>
        </div>

        {!isAuthenticated && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              <strong>Connectez-vous</strong> pour utiliser vos points ou voir
              votre solde
            </p>
          </div>
        )}
      </div>

      {showShippingForm && paymentMethod === 'POINTS' && (
        <div className="bg-white border-2 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <MapPin size={20} className="mr-2 text-[#0a3d3f]" />
            <h4 className="text-lg font-medium text-[#010101]">
              Adresse de livraison
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#010101] mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={shippingData.address}
                onChange={handleShippingChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                placeholder="123 Rue de la Paix"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#010101] mb-2">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={shippingData.city}
                onChange={handleShippingChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                placeholder="Paris"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#010101] mb-2">
                Code postal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={shippingData.postalCode}
                onChange={handleShippingChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                placeholder="75001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#010101] mb-2">
                Pays
              </label>
              <select
                name="country"
                value={shippingData.country}
                onChange={handleShippingChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
              >
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#010101] mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={shippingData.phone}
                onChange={handleShippingChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex flex-col gap-4">
        {paymentMethod === 'POINTS' ? (
          showShippingForm ? (
            <button
              onClick={handleConfirmPurchase}
              disabled={isPending || !canPayWithPoints}
              className={`w-full py-4 px-6 rounded-full font-medium transition-colors flex items-center justify-center ${
                canPayWithPoints && !isPending
                  ? 'bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Commande en cours...
                </>
              ) : (
                <>
                  <Coins size={20} className="mr-2" />
                  Confirmer l&apos;achat ({totalPoints} points)
                </>
              )}
            </button>
          ) : (
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
          )
        ) : (
          <button
            onClick={() => router.push('/panier/redirect')}
            className="w-full py-4 px-6 bg-[#0a3d3f] text-white rounded-full font-medium hover:bg-[#0a4d4f] transition-colors flex items-center justify-center cursor-pointer"
          >
            <CreditCard size={20} className="mr-2" />
            Payer par carte
          </button>
        )}

        {showShippingForm && (
          <button
            onClick={() => setShowShippingForm(false)}
            className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Retour aux méthodes de paiement
          </button>
        )}
      </div>
    </div>
  );
};
