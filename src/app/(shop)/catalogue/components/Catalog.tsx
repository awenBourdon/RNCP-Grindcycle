/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductList } from './ProductsList';
import { Filters } from './Filters';
import { Product } from '@/lib/utils/types/types';
import { PaginationMeta } from '@/lib/utils/pagination';
import { useAbortController } from '@/hooks/useAbortController';

export const Catalog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createSignal } = useAbortController();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const initializeFiltersFromUrl = useCallback(() => {
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 200;

    return {
      types,
      priceRange: [minPrice, maxPrice] as [number, number],
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(initializeFiltersFromUrl);
  const [priceRangeValues, setPriceRangeValues] = useState<[number, number]>([
    filters.priceRange[0],
    filters.priceRange[1],
  ]);

  const fetchProducts = async (minPrice: number, maxPrice: number) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        available: 'true',
        page: '1',
        limit: '20',
      });

      if (minPrice !== 0) {
        params.set('minPrice', minPrice.toString());
      }
      if (maxPrice !== 200) {
        params.set('maxPrice', maxPrice.toString());
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement produits');
      }

      const result = await response.json();

      if (!signal.aborted) {
        setAllProducts(result.data);
        setMeta(result.meta);
        setCurrentPage(1);
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
    fetchProducts(filters.priceRange[0], filters.priceRange[1]);
  }, []);

  const loadMoreProducts = async () => {
    if (loading || !meta.hasNextPage) return;

    const signal = createSignal();
    setLoading(true);

    try {
      const params = new URLSearchParams({
        available: 'true',
        page: (currentPage + 1).toString(),
        limit: '20',
      });

      if (filters.priceRange[0] !== 0) {
        params.set('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] !== 200) {
        params.set('maxPrice', filters.priceRange[1].toString());
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement produits');
      }

      const result = await response.json();

      if (!signal.aborted) {
        setAllProducts(prev => [...prev, ...result.data]);
        setMeta(result.meta);
        setCurrentPage(prev => prev + 1);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement produits:', error);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  const updateUrl = useCallback(
    (newFilters: typeof filters, newPriceRange: [number, number]) => {
      const params = new URLSearchParams();

      if (newFilters.types.length > 0) {
        params.set('types', newFilters.types.join(','));
      }

      if (newPriceRange[0] !== 0 || newPriceRange[1] !== 200) {
        params.set('minPrice', newPriceRange[0].toString());
        params.set('maxPrice', newPriceRange[1].toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      setTimeout(() => {
        router.push(newUrl, { scroll: false });
      }, 0);
    },
    [router]
  );

  const filteredProducts = allProducts.filter(product => {
    if (filters.types.length > 0 && !filters.types.includes(product.type)) {
      return false;
    }
    return true;
  });

  const handleTypeChange = useCallback(
    (type: string) => {
      setFilters(prev => {
        const newTypes = prev.types.includes(type)
          ? prev.types.filter(t => t !== type)
          : [...prev.types, type];

        const newFilters = { ...prev, types: newTypes };
        updateUrl(newFilters, priceRangeValues);
        return newFilters;
      });
    },
    [priceRangeValues, updateUrl]
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newValue = Number.parseInt(e.target.value) || 0;
      const newValues: [number, number] = [...priceRangeValues];
      newValues[index] = newValue;

      if (index === 0 && newValue > priceRangeValues[1]) {
        newValues[1] = newValue;
      } else if (index === 1 && newValue < priceRangeValues[0]) {
        newValues[0] = newValue;
      }

      setPriceRangeValues(newValues);

      setFilters(prev => {
        const newFilters = { ...prev, priceRange: newValues };
        updateUrl(newFilters, newValues);
        fetchProducts(newValues[0], newValues[1]);
        return newFilters;
      });
    },
    [priceRangeValues, updateUrl]
  );

  const resetFilters = useCallback(() => {
    const resetFiltersData = {
      types: [],
      priceRange: [0, 200] as [number, number],
    };
    const resetPriceRange: [number, number] = [0, 200];

    setFilters(resetFiltersData);
    setPriceRangeValues(resetPriceRange);
    updateUrl(resetFiltersData, resetPriceRange);
    fetchProducts(0, 200);
  }, [updateUrl]);

  return (
    <div className="pb-24">
      <Filters
        filters={filters}
        handleTypeChange={handleTypeChange}
        handlePriceChange={handlePriceChange}
        resetFilters={resetFilters}
        priceRangeValues={priceRangeValues}
      />
      <div className="mt-8">
        {loading && allProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Chargement des produits...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600 text-lg">
              Aucun produit disponible
            </div>
          </div>
        ) : (
          <>
            <ProductList filteredProducts={filteredProducts} />

            {meta.hasNextPage && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMoreProducts}
                  disabled={loading}
                  className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Chargement...'
                    : `Charger plus (${filteredProducts.length}/${meta.totalItems})`}
                </button>
              </div>
            )}

            {!meta.hasNextPage && filteredProducts.length > 0 && (
              <div className="mt-12 text-center text-gray-600">
                <p>Tous les produits ont été chargés</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
