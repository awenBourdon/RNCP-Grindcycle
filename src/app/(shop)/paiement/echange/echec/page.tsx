'use client';
import { Suspense } from 'react';
import { ExchangePointsError } from '../../components/ExchangePointsError';

export default function PointsErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a3d3f] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <ExchangePointsError />
    </Suspense>
  );
}
