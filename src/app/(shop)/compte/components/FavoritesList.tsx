'use client';
import { useState, useEffect } from 'react';
import { useAbortController } from '@/hooks/useAbortController';
import { PaginationMeta } from '@/lib/utils/pagination';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BoardType } from '@/lib/utils/enums/enums';
import { Product } from '@/lib/utils/types/types';

interface FavoriteWithProduct {
  userId: string;
  productId: string;
  product: Product;
}

const getBoardTypeText = (type: BoardType) => {
  switch (type) {
    case BoardType.SKATE:
      return 'Skateboard';
    case BoardType.CRUISER:
      return 'Cruiser';
    case BoardType.LONG:
      return 'Longboard';
    default:
      return type;
  }
};

export const FavoritesList = () => {
  const { createSignal } = useAbortController();
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFavorites = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/favorites?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement favoris');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setFavorites(result.data);
        } else {
          setFavorites(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement favoris:', error);
        if (!signal.aborted) {
          setError('Impossible de charger les favoris');
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFavorites(1);
  }, []);

  const loadMoreFavorites = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchFavorites(currentPage + 1);
  };

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchFavorites(1)}
            className="px-4 py-2 bg-[#0a3d3f] text-white rounded-lg hover:bg-[#083032] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center mb-8">
          <Heart size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">Mes favoris</h2>
          {meta.totalItems > 0 && (
            <span className="ml-4 text-sm text-gray-600">
              {favorites.length}/{meta.totalItems} produit
              {meta.totalItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && favorites.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Chargement des favoris...</div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#010101] mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-600 mb-6">
              Tu n&apos;as pas encore ajouté de produits en favoris
            </p>
            <Link href="/catalogue" className="text-[#0a3d3f] hover:underline">
              Découvrir nos planches
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(({ product }) => (
              <Link
                key={product.id}
                href={`/produit/${product.id}`}
                className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={product.imageUrl[0] || '/placeholder.webp'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {getBoardTypeText(product.type)}
                  </p>
                  <p className="text-[#0a3d3f] font-medium">
                    {product.priceEuro}€
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {meta.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreFavorites}
            disabled={loading}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Chargement...'
              : `Charger plus (${favorites.length}/${meta.totalItems})`}
          </button>
        </div>
      )}

      {!meta.hasNextPage && favorites.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Tous les favoris ont été chargés</p>
        </div>
      )}
    </div>
  );
};
