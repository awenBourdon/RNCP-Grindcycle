'use client';
import { ShoppingCart, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { FavoriteButton } from './FavoriteButton';
import { ProductType } from '@/lib/utils/types/types';

interface ProductActionsProps {
  product: ProductType;
  added: boolean;
  handleToggleCart: () => void;
  isPending: boolean;
  isAvailable: boolean;
  isAuthenticated: boolean;
  isFavorite: boolean;
  isLoadingFavorites: boolean;
  toggleFavorite: () => Promise<void>;
}

export const ProductActions = ({
  product,
  added,
  handleToggleCart,
  isPending,
  isAvailable,
  isAuthenticated,
  isFavorite,
  isLoadingFavorites,
  toggleFavorite,
}: ProductActionsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button
          onClick={handleToggleCart}
          disabled={isPending || !isAvailable}
          className="flex-1 px-6 py-4 text-base sm:text-lg font-medium rounded-full transition-all duration-300 flex items-center justify-center bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] cursor-pointer"
        >
          <div className="flex items-center justify-center min-w-[180px]">
            {isPending ? (
              <Spinner />
            ) : !isAvailable ? (
              <span>Produit vendu</span>
            ) : added ? (
              <>
                <X className="w-5 h-5 mr-2" />
                <span>Retirer du panier</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span>Ajouter au panier</span>
              </>
            )}
          </div>
        </button>
        {isAvailable && (
          <FavoriteButton
            productId={product.id}
            isAuthenticated={isAuthenticated}
            isFavorite={isFavorite}
            isLoadingFavorites={isLoadingFavorites}
            toggleFavorite={toggleFavorite}
          />
        )}
      </div>
      <div className="bg-[#f8f7f4] rounded-xl p-6">
        <div className="space-y-3">
          <p className="text-gray-600">
            <span className="font-medium text-[#010101]">
              Livraison gratuite
            </span>{' '}
            à partir de 100€ d&apos;achat
          </p>
          <p className="text-gray-600">
            <span className="font-medium text-[#010101]">Retour gratuit</span>{' '}
            sous 14 jours
          </p>
          <p className="text-gray-600">
            <span className="font-medium text-[#010101]">Garantie qualité</span>{' '}
            - Vérifiée avant expédition
          </p>
        </div>
      </div>
    </div>
  );
};
