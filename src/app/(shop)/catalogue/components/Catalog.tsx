'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductList } from './ProductsList';
import { Filters } from './Filters';
import { ProductType } from '@/lib/types';

interface CatalogProps {
  products: ProductType[];
}

export const Catalog = ({ products }: CatalogProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initializeFiltersFromUrl = useCallback(() => {
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 200;

    return {
      types,
      priceRange: [minPrice, maxPrice] as [number, number],
      sizes: [] as number[],
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(initializeFiltersFromUrl);
  const [priceRangeValues, setPriceRangeValues] = useState<[number, number]>([
    filters.priceRange[0],
    filters.priceRange[1],
  ]);

  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

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

      setPendingUrl(newUrl);
    },
    []
  );

  useEffect(() => {
    if (pendingUrl) {
      router.push(pendingUrl, { scroll: false });
      setPendingUrl(null);
    }
  }, [pendingUrl, router]);

  useEffect(() => {
    const newFilters = initializeFiltersFromUrl();
    setFilters(newFilters);
    setPriceRangeValues([newFilters.priceRange[0], newFilters.priceRange[1]]);
  }, [initializeFiltersFromUrl]);

  const filteredProducts = products.filter(product => {
    if (filters.types.length > 0 && !filters.types.includes(product.type)) {
      return false;
    }

    if (
      product.priceEuro < filters.priceRange[0] ||
      product.priceEuro > filters.priceRange[1]
    ) {
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
        return newFilters;
      });
    },
    [priceRangeValues, updateUrl]
  );

  const resetFilters = useCallback(() => {
    const resetFiltersData = {
      types: [],
      priceRange: [0, 200] as [number, number],
      sizes: [],
    };
    const resetPriceRange: [number, number] = [0, 200];

    setFilters(resetFiltersData);
    setPriceRangeValues(resetPriceRange);
    updateUrl(resetFiltersData, resetPriceRange);
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
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            {filteredProducts.length} produit
            {filteredProducts.length !== 1 ? 's' : ''} trouvé
            {filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ProductList filteredProducts={filteredProducts} />
      </div>
    </div>
  );
};
