'use client';
import { Suspense } from 'react';
import { SuccessContent } from '../components/SuccessContent';

// TODO : refaire cette page en SSR
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
