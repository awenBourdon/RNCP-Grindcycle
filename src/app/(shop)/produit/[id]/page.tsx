'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAbortController } from '@/hooks/useAbortController';
import { ProductDisplay } from './components/ProductDisplay';

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { createSignal } = useAbortController();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    const signal = createSignal();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/products/${id}`, { signal });
      const data = await response.json();

      if (response.status === 429) {
        setError(data.error || 'Trop de requêtes');
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || 'Erreur');
        return;
      }

      setProduct(data.data);
    } catch {
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [id, createSignal]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!product || error) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-32">
      <ProductDisplay product={product} />
    </div>
  );
}
