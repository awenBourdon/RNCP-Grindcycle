'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/CartContext';
import { ReturnButton } from '@/components/ui/ReturnButton';
import { toast } from 'sonner';
import type { PointsShippingInput } from '@/lib/validations/shipping.validation';
import { ShippingForm } from '@/components/form/ShippingForm';

export default function ShippingPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, getShippingCost } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleShippingSubmit = async (formData: PointsShippingInput) => {
    console.log('🚀 [SHIPPING PAGE] === DÉBUT SOUMISSION ===');
    console.log('🚀 [SHIPPING PAGE] Form data:', formData);
    console.log('🚀 [SHIPPING PAGE] Cart items bruts:', cartItems);

    if (cartItems.length === 0) {
      console.error('❌ [SHIPPING PAGE] Panier vide');
      toast.error('Le panier est vide');
      router.push('/panier');
      return;
    }

    setIsLoading(true);

    try {
      // Plus besoin de transformation manuelle, le schema s'en charge !
      const requestBody = {
        cartItems, // Envoi direct - le schema transformera automatiquement
        shippingCost: getShippingCost(),
        shippingAddress: formData,
        userId: null, // TODO: récupérer depuis un contexte d'auth si nécessaire
      };

      console.log(
        '📨 [SHIPPING PAGE] Request body:',
        JSON.stringify(requestBody, null, 2)
      );

      console.log('🌐 [SHIPPING PAGE] Appel API...');
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(
        '📨 [SHIPPING PAGE] Réponse reçue:',
        response.status,
        response.statusText
      );

      const data = await response.json();
      console.log('📨 [SHIPPING PAGE] Data reçue:', data);

      if (!response.ok) {
        console.error('❌ [SHIPPING PAGE] Erreur API:', data);
        throw new Error(
          data.error || 'Erreur lors de la création de la session'
        );
      }

      if (data.url) {
        console.log('✅ [SHIPPING PAGE] URL Stripe reçue:', data.url);
        console.log('💾 [SHIPPING PAGE] Sauvegarde pending order...');

        sessionStorage.setItem(
          'pendingOrder',
          JSON.stringify({
            cartItems,
            shippingAddress: formData,
            shippingCost: getShippingCost(),
            totalAmount: getCartTotal() + getShippingCost(),
            orderId: data.orderId,
          })
        );

        console.log('🔄 [SHIPPING PAGE] Redirection vers Stripe...');
        window.location.href = data.url;
      } else {
        console.error(
          "❌ [SHIPPING PAGE] Pas d'URL de paiement dans la réponse"
        );
        throw new Error('URL de paiement non disponible');
      }
    } catch (error) {
      console.error('💥 [SHIPPING PAGE] Erreur complète:', error);
      console.error(
        '💥 [SHIPPING PAGE] Stack:',
        error instanceof Error ? error.stack : 'Pas de stack'
      );
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      console.log('🏁 [SHIPPING PAGE] === FIN SOUMISSION ===');
      setIsLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = getShippingCost();
  const total = subtotal + shipping;

  // Debug des données du panier
  console.log('🛒 [SHIPPING PAGE] Cart items actuels:', cartItems);
  console.log('💰 [SHIPPING PAGE] Subtotal:', subtotal);
  console.log('🚚 [SHIPPING PAGE] Shipping:', shipping);
  console.log('💳 [SHIPPING PAGE] Total:', total);

  if (cartItems.length === 0) {
    console.log('🔄 [SHIPPING PAGE] Panier vide, redirection...');
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
                    <span className="text-gray-600">{item.name}</span>
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
