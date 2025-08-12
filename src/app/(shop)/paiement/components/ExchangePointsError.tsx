'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function ExchangePointsError() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
            Une erreur est survenue
          </h1>

          <p className="text-xl text-gray-600 mb-12">
            Ton achat avec les points n&apos;a pas pu être finalisé. Aucun point
            n&apos;a été débité.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/panier"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Retour au panier
            </Link>

            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
