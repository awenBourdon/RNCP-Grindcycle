'use client';
import { Hash, Eye, Trash2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import type { Product, BoardType } from '@/generated/prisma';
import { useTransition, useState, useEffect } from 'react';
import { deleteProductAction } from '@/actions/products/delete-product';
import { ProductStatusSelect } from './ProductStatusSelect';
import { PaginationMeta } from '@/lib/utils/pagination';
import { useAbortController } from '@/hooks/useAbortController';

interface ProductWithUsedBoard extends Product {
  usedBoard?: {
    id: string;
    name: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
}

const getBoardTypeText = (type: BoardType) => {
  switch (type) {
    case 'SKATE':
      return 'Skateboard';
    case 'CRUISER':
      return 'Cruiser';
    case 'LONG':
      return 'Longboard';
    default:
      return type;
  }
};

export const ProductsTable = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { createSignal } = useAbortController();

  const [products, setProducts] = useState<ProductWithUsedBoard[]>([]);
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

  const fetchProducts = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/products?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement produits');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setProducts(result.data);
        } else {
          setProducts(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement produits:', error);
        if (!signal.aborted) {
          setError('Impossible de charger les produits');
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const loadMoreProducts = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchProducts(currentPage + 1);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/produit/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteProductAction(productId);
        if (result.success) {
          toast.success(result.message);
          await fetchProducts(1);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    });
  };

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts(1)}
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
          <Package size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Produits du catalogue
          </h2>
          {meta.totalItems > 0 && (
            <span className="ml-4 text-sm text-gray-600">
              {products.length}/{meta.totalItems} produit
              {meta.totalItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Chargement des produits...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <Hash size={16} />
                        ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Nom du produit
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Type
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Prix €
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Points
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Planche d&apos;origine
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Date création
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {product.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 relative">
                          {product.imageUrl && product.imageUrl.length > 0 ? (
                            <Image
                              src={product.imageUrl[0] || '/placeholder.webp'}
                              alt={product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-[#010101]">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getBoardTypeText(product.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-[#010101]">
                          {product.priceEuro.toFixed(2)} €
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-[#0a3d3f]">
                          {product.pricePoints} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ProductStatusSelect
                          productId={product.id}
                          status={product.status}
                        />
                      </td>
                      <td className="px-6 py-4">
                        {product.usedBoard ? (
                          <div className="text-sm">
                            <p className="font-medium text-[#010101]">
                              {product.usedBoard.name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            Aucune planche liée
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {new Date(product.createdAt).toLocaleDateString(
                            'fr-FR'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="text-[#0a3d3f] hover:text-[#0a3d3f]/80 p-1 transition-colors cursor-pointer"
                            title="Voir le produit"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isPending}
                            className="text-gray-600 hover:text-red-600 p-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer le produit"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && !loading && (
              <div className="px-6 py-12 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500">
                  Il n&apos;y a actuellement aucun produit dans le catalogue.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {meta.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreProducts}
            disabled={loading}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Chargement...'
              : `Charger plus (${products.length}/${meta.totalItems})`}
          </button>
        </div>
      )}

      {!meta.hasNextPage && products.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Tous les produits ont été chargés</p>
        </div>
      )}
    </div>
  );
};
