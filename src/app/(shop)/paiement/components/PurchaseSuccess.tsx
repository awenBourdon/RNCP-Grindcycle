'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface OrderDetails {
  id: string;
  totalAmount: number;
  shippingCost: number;
  customerEmail: string;
  status: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
    priceEuro: number;
  }>;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
}

export function PurchaseSuccess() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !orderId) {
        setError('Paramètres manquants pour confirmer le paiement');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            orderId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la confirmation');
        }

        const data = await response.json();

        console.log(data);

        if (data.success) {
          setOrderDetails(data.order);
          clearCart();
          sessionStorage.removeItem('pendingOrder');
        } else {
          throw new Error(data.error || 'Paiement non confirmé');
        }
      } catch (err) {
        console.error('Erreur confirmation:', err);
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue'
        );
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [sessionId, orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a3d3f] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Finalisation de ta commande...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-medium text-black mb-4">
            Erreur de confirmation
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <Link
            href="/panier"
            className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Retour au panier
          </Link>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Aucune commande trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-[#0A3D3F]" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
            Commande confirmée !
          </h1>

          <div className="bg-[#f8f7f4] rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <CreditCard size={24} className="text-[#0a3d3f] mr-2" />
              <span className="text-lg font-medium text-[#0a3d3f]">
                Paiement réussi
              </span>
            </div>
            <p className="text-gray-600">
              Ta commande a été traitée avec succès pour un montant de{' '}
              <strong>
                {(orderDetails.totalAmount + orderDetails.shippingCost).toFixed(
                  2
                )}{' '}
                €
              </strong>
              <span className="block mt-2 font-medium">
                Numéro de commande: #{orderDetails.id.slice(-8)}
              </span>
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-medium text-black mb-4 flex items-center justify-center">
              <Package size={20} className="mr-2" />
              Articles commandés
            </h3>
            <div className="space-y-3">
              {orderDetails.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-600">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.priceEuro * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
              {orderDetails.shippingCost > 0 && (
                <div className="flex justify-between items-center py-2 border-t border-gray-200">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {orderDetails.shippingCost.toFixed(2)} €
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="font-medium">
                  {orderDetails.shippingCost === 0
                    ? 'Livraison offerte'
                    : 'Livraison standard'}
                </p>
                <p className="text-sm text-gray-600">
                  Ta commande sera expédiée sous 24-48h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
