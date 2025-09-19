'use client';
import { useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { purchaseWithPointsAction } from '@/actions/orders/purchase-with-points';
import { type PointsShippingInput } from '@/lib/validations/shippingValidation';
import { ShippingForm } from '@/components/form/ShippingForm';

interface ExchangePointsShippingProps {
  userPoints: number;
  isAuthenticated: boolean;
}

export function ExchangePointsShipping({
  userPoints,
  isAuthenticated,
}: ExchangePointsShippingProps) {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const totalPoints = cartItems.reduce((total, item) => {
    return total + item.priceEuro * item.quantity;
  }, 0);

  const canPayWithPoints = isAuthenticated && userPoints >= totalPoints;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentification/connexion');
      return;
    }

    if (cartItems.length === 0 || totalPoints === 0) {
      router.push('/panier');
      return;
    }

    if (!canPayWithPoints) {
      router.push('/panier');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShippingSubmit = (formData: PointsShippingInput) => {
    if (!canPayWithPoints) {
      toast.error('Points insuffisants pour cette commande');
      router.push('/panier');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Le panier est vide');
      router.push('/panier');
      return;
    }

    if (totalPoints === 0) {
      router.push('/panier');
      return;
    }

    startTransition(async () => {
      try {
        const formDataAction = new FormData();
        const cartItemsForPurchase = cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          type: item.type,
          priceEuro: item.priceEuro,
          pricePoints: item.pricePoints,
          quantity: item.quantity,
        }));

        formDataAction.append(
          'cartItems',
          JSON.stringify(cartItemsForPurchase)
        );
        formDataAction.append(
          'shippingAddress',
          JSON.stringify({
            ...formData,
            fullName: `${formData.firstName} ${formData.lastName}`,
          })
        );

        const result = await purchaseWithPointsAction(formDataAction);

        if (result.success) {
          clearCart();
          router.push(
            `/paiement/echange/succes?orderId=${result.data?.orderId}`
          );
        } else {
          router.push(
            `/paiement/echange/echec?error=${encodeURIComponent(result.error || 'Erreur inconnue')}`
          );
        }
      } catch {
        router.push(
          `/paiement/echange/echec?error=${encodeURIComponent("Une erreur est survenue lors de l'échange.")}`
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <Link
          href="/panier"
          className="inline-flex items-center text-gray-600 hover:text-[#0a3d3f] transition-colors group mb-12"
        >
          <ArrowLeft
            size={16}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          <span className="border-b border-transparent group-hover:border-[#0a3d3f] pb-0.5 transition-colors">
            Retour au panier
          </span>
        </Link>

        <div className="flex items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-normal text-black">
              Échanger mes points
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Utilisation de {totalPoints} points • Livraison offerte
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <ShippingForm
              onSubmit={handleShippingSubmit}
              isLoading={isPending}
              submitText={`Confirmer l'achat (${totalPoints} points)`}
            />
          </div>

          <div>
            <div className="bg-[#f8f7f4] p-6 rounded-xl sticky top-40">
              <h3 className="text-xl font-medium mb-6">Récapitulatif</h3>

              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <p className="text-[#0a3d3f] font-medium">
                      {item.priceEuro * item.quantity} points
                    </p>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Livraison</span>
                    <span className="text-[#0A3D3F] font-medium">Gratuite</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-[#0a3d3f]">{totalPoints} points</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-sm text-[#0A3D3F] font-medium">
                    Solde après échange: {userPoints - totalPoints} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
