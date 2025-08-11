'use client';
import { useState, useTransition, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ReturnButton } from '@/components/ui/ReturnButton';
import { toast } from 'sonner';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfo } from './ProductInfo';
import { ProductActions } from './ProductActions';
import { ProductType } from '@/lib/types';
import { useAbortController } from '@/hooks/useAbortController';
import { favoritesAction } from '@/actions/favorites/favorite.action';

interface ProductDisplayProps {
  product: ProductType;
}

interface FavoriteResponse {
  success: boolean;
  data: Array<{ productId: string }>;
}

export const ProductDisplay = ({ product }: ProductDisplayProps) => {
  const cartProduct = {
    ...product,
    description: product.description ?? undefined,
  };

  const { addToCart, removeFromCart, isInCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [isFavoritePending, startFavoriteTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { createSignal } = useAbortController();

  useEffect(() => {
    setAdded(isInCart(product));
  }, [product, isInCart]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const signal = createSignal();

      try {
        const response = await fetch('/api/favorites', {
          signal: signal,
        });

        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des favoris');
        }

        const data: FavoriteResponse = await response.json();

        if (data && data.success) {
          setFavorites(data.data.map(f => f.productId));
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erreur favoris:', error);
          setIsAuthenticated(false);
        }
      }
    };

    fetchFavorites();
  }, [createSignal]);

  const isFavorite = favorites.includes(product.id);
  const isAvailable = product.status === 'CATALOG';

  const toggleFavorite = async () => {
    if (isFavoritePending || !isAuthenticated) return;

    startFavoriteTransition(async () => {
      try {
        const result = await favoritesAction(product.id);

        if (result.success) {
          if (result.action === 'added') {
            setFavorites(prev => [...prev, product.id]);
          } else {
            setFavorites(prev => prev.filter(id => id !== product.id));
          }
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des favoris:', error);
        toast.error('Une erreur est survenue');
      }
    });
  };

  const handleToggleCart = () => {
    startTransition(() => {
      if (added) {
        removeFromCart(cartProduct);
        toast.success('Retiré du panier');
      } else {
        addToCart(cartProduct);
        toast.success('Ajouté au panier');
      }
      setAdded(!added);
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ReturnButton href="/catalogue" label="Catalogue" />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <ProductImageGallery
          images={product.imageUrl || []}
          productName={product.name}
        />

        <div className="space-y-6 lg:space-y-8">
          <ProductInfo product={product} />
          <ProductActions
            product={product}
            added={added}
            handleToggleCart={handleToggleCart}
            isPending={isPending}
            isAvailable={isAvailable}
            isAuthenticated={isAuthenticated}
            isFavorite={isFavorite}
            isLoadingFavorites={isFavoritePending}
            toggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  );
};
