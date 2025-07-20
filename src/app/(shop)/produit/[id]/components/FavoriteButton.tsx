'use client'
import { Heart } from 'lucide-react'

interface FavoriteButtonProps {
  productId: string
  isAuthenticated: boolean
  isFavorite: boolean
  isLoadingFavorites: boolean
  toggleFavorite: () => Promise<void>
}

export const FavoriteButton = ({
  isAuthenticated,
  isFavorite,
  isLoadingFavorites,
  toggleFavorite,
}: FavoriteButtonProps) => {
  if (isAuthenticated) {
    return (
      <button
        onClick={toggleFavorite}
        disabled={isLoadingFavorites}
        className={`w-14 h-14 rounded-full border-2 transition-all duration-300 flex items-center justify-center group cursor-pointer ${
          isLoadingFavorites ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isFavorite
            ? 'bg-[#0a3d3f] border-[#0a3d3f] hover:bg-[#0a3d3f]'
            : 'bg-white border-[#0a3d3f] hover:bg-[#0a3d3f]'
        }`}
      >
        <Heart
          size={20}
          className={`transition-all duration-300 transform group-hover:scale-110 ${
            isFavorite
              ? 'fill-white text-white'
              : 'text-[#0a3d3f] group-hover:text-white'
          }`}
        />
      </button>
    )
  }
}
