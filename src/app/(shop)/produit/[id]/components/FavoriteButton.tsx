'use client';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId: string;
  isAuthenticated: boolean;
  isFavorite: boolean;
  isLoadingFavorites: boolean;
  toggleFavorite: () => Promise<void>;
}

export const FavoriteButton = ({
  isAuthenticated,
  isFavorite,
  isLoadingFavorites,
  toggleFavorite,
}: FavoriteButtonProps) => {
  const router = useRouter();

  const handleClick = async () => {
    if (isAuthenticated) {
      await toggleFavorite();
    } else {
      router.push('/authentification/connexion');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoadingFavorites}
      className={`w-14 h-14 rounded-full bg-white transition-all duration-300 flex items-center justify-center group cursor-pointer ${
        isLoadingFavorites ? 'opacity-50 cursor-not-allowed' : ''
      } ${isFavorite ? 'border-red-500' : 'border-[#0a3d3f]'}`}
      aria-label={
        isFavorite
          ? 'Retirer ce produit de mes favoris'
          : 'Ajouter ce produit à mes favoris'
      }
      aria-pressed={isFavorite}
    >
      <Heart
        size={24}
        className={`transition-all duration-300 transform group-hover:scale-110 ${
          isFavorite ? 'fill-red-500 text-red-500' : ''
        }`}
        aria-hidden="true"
      />
    </button>
  );
};
