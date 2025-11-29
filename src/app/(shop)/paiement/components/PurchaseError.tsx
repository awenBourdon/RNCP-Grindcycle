'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function PurchaseError() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const cancelOrder = async () => {
      if (!orderId) return;
      try {
        await fetch('/api/orders/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      } catch (error) {
        console.error("Erreur lors de l'annulation:", error);
      }
    };
    cancelOrder();
  }, [orderId]);

  return (
    <div
      className="min-h-screen bg-white"
      aria-label="Page d'erreur de paiement"
    >
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
            Une erreur est survenue
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Ton paiement n&apos;a pas pu être finalisé. Aucun montant n&apos;a
            été débité de ton compte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/panier"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
              aria-label="Retourner au panier"
            >
              <ArrowLeft size={16} className="mr-2" aria-hidden="true" />
              Retour au panier
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              aria-label="Retourner au catalogue"
            >
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
