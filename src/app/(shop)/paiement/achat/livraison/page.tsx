'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ReturnButton } from '@/components/ui/ReturnButton';
import { toast } from 'sonner';
import type { PointsShippingInput } from '@/lib/validations/shippingValidation';
import { ShippingForm } from '@/components/form/ShippingForm';

export default function ShippingPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, getShippingCost } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleShippingSubmit = async (formData: PointsShippingInput) => {
    if (cartItems.length === 0) {
      toast.error('Le panier est vide');
      router.push('/panier');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          shippingCost: getShippingCost(),
          shippingAddress: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erreur lors de la création de la session'
        );
      }

      if (data.url) {
        sessionStorage.setItem(
          'pendingOrder',
          JSON.stringify({
            cartItems,
            shippingAddress: formData,
            shippingCost: getShippingCost(),
            totalAmount: getCartTotal() + getShippingCost(),
          })
        );

        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non disponible');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = getShippingCost();
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    router.push('/panier');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-8">
          <ReturnButton href="/panier" label="Panier" />
        </div>

        <h1 className="text-4xl md:text-6xl font-normal text-black mb-12">
          Adresse de livraison
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <ShippingForm
              onSubmit={handleShippingSubmit}
              isLoading={isLoading}
              submitText="Procéder au paiement"
            />
          </div>

          <div>
            <div className="bg-[#f8f7f4] p-6 rounded-lg sticky top-40">
              <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.priceEuro * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span>
                      {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <div className="text-sm text-gray-500 italic mt-2">
                      Livraison gratuite à partir de 100€ d&apos;achat
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                En procédant au paiement, tu acceptes nos conditions générales
                de vente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
