'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Coins } from 'lucide-react';
import Link from 'next/link';

export function ExchangePointsSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center"
        aria-label="Chargement de la confirmation de commande"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a3d3f] mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-lg text-gray-600" role="status">
            Finalisation de ta commande...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white"
      aria-label="Page de confirmation d'échange de points réussi"
    >
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8" aria-hidden="true">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-[#0A3D3F]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
            Commande confirmée !
          </h1>
          <div
            className="bg-[#f8f7f4] rounded-xl p-6 mb-8"
            role="region"
            aria-label="Confirmation de l'échange de points"
          >
            <div className="flex items-center justify-center mb-4">
              <Coins
                size={24}
                className="text-[#0a3d3f] mr-2"
                aria-hidden="true"
              />
              <span className="text-lg font-medium text-[#0a3d3f]">
                Échange réalisé avec tes points
              </span>
            </div>
            <p className="text-gray-600">
              Ta commande a été traitée avec succès grâce à tes points
              Grindcycle.
              {orderId && (
                <span
                  className="block mt-2 font-medium"
                  aria-label={`Numéro de commande : ${orderId}`}
                >
                  Numéro de commande: #{orderId}
                </span>
              )}
            </p>
          </div>
          <div
            className="space-y-4 mb-12"
            role="region"
            aria-label="Détails de la livraison et confirmation"
          >
            <div
              className="flex items-center justify-center p-4 bg-blue-50 rounded-lg"
              aria-label="Livraison gratuite, expédition sous 24-48 heures"
            >
              <div className="text-left">
                <p className="font-medium">Livraison offerte</p>
                <p className="text-sm">Ta commande sera expédiée sous 24-48h</p>
              </div>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">
                Un email de confirmation va être envoyé avec tous les détails de
                ta commande.
              </p>
              <p>
                Tu peux également retrouver ta commande dans ton espace
                personnel.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/compte/commandes"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
              aria-label="Accéder à mes commandes"
            >
              Voir mes commandes
              <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              aria-label="Continuer le shopping au catalogue"
            >
              Continuer le shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
