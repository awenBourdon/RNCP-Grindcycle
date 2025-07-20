'use client'

import { useState, useTransition, useEffect } from 'react'
import { ShoppingCart, X, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Spinner } from '@/components/ui/Spinner'
import { ReturnButton } from '@/components/ui/ReturnButton'
import { toast } from 'sonner'
import type { ProductType } from '@/lib/types'

interface ProductDisplayProps {
  product: {
    id: string
    name: string
    description: string | null
    type: string
    priceEuro: number
    pricePoints: number | null
    imageUrl: string[]
    status: string
    usedBoard?: {
      id: string
      name: string
      boardType: string
      user?: {
        id: string
        name: string | null
        email: string
      }
    } | null
  }
}

interface FavoriteResponse {
  success: boolean
  data: Array<{ productId: string }>
}

interface FavoriteItem {
  productId: string
}

const getBoardTypeText = (type: string) => {
  switch (type) {
    case 'SKATE':
      return 'Skateboard'
    case 'CRUISER':
      return 'Cruiser'
    case 'LONG':
      return 'Longboard'
    default:
      return type
  }
}

export const ProductDisplay = ({ product }: ProductDisplayProps) => {
  // Conversion du produit Prisma vers ProductType
  const normalizedProduct: ProductType = {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    type: product.type,
    priceEuro: product.priceEuro,
    pricePoints: product.pricePoints ?? 0,
    imageUrl: product.imageUrl || [],
    status: product.status,
    usedBoard: product.usedBoard
      ? {
          id: product.usedBoard.id,
          name: product.usedBoard.name,
          boardType: product.usedBoard.boardType,
        }
      : undefined,
  }

  // Conversion pour le panier
  const cartProduct = {
    id: normalizedProduct.id,
    name: normalizedProduct.name,
    type: normalizedProduct.type,
    priceEuro: normalizedProduct.priceEuro,
    pricePoints: normalizedProduct.pricePoints,
    imageUrl: normalizedProduct.imageUrl,
    status: normalizedProduct.status,
    quantity: 1,
  }

  const { addToCart, removeFromCart, isInCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // États pour les favoris
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setAdded(isInCart(normalizedProduct))
  }, [normalizedProduct, isInCart])

  // Charger les favoris au montage du composant
  useEffect(() => {
    fetch('/api/favorites')
      .then((res) => {
        if (res.status === 401) {
          setIsAuthenticated(false)
          return null
        }
        setIsAuthenticated(true)
        return res.json()
      })
      .then((data: FavoriteResponse | null) => {
        if (data && data.success) {
          setFavorites(data.data.map((f: FavoriteItem) => f.productId))
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

  const displayImages =
    normalizedProduct.imageUrl && normalizedProduct.imageUrl.length > 0
      ? normalizedProduct.imageUrl
      : ['/placeholder.svg?height=400&width=400']
  const isFavorite = favorites.includes(normalizedProduct.id)
  const isAvailable = normalizedProduct.status === 'CATALOG'

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    )
  }

  const toggleFavorite = async () => {
    if (isLoadingFavorites || !isAuthenticated) return

    setIsLoadingFavorites(true)
    try {
      if (isFavorite) {
        const response = await fetch(
          `/api/favorites?productId=${normalizedProduct.id}`,
          {
            method: 'DELETE',
          }
        )
        if (response.ok) {
          setFavorites((prev) =>
            prev.filter((id) => id !== normalizedProduct.id)
          )
          toast.success('Retiré des favoris')
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: normalizedProduct.id }),
        })
        if (response.ok) {
          setFavorites((prev) => [...prev, normalizedProduct.id])
          toast.success('Ajouté aux favoris')
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const handleToggleCart = () => {
    startTransition(() => {
      if (added) {
        removeFromCart(cartProduct)
        toast.success('Retiré du panier')
      } else {
        addToCart(cartProduct)
        toast.success('Ajouté au panier')
      }
      setAdded(!added)
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <ReturnButton href="/catalogue" label="Catalogue" />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Galerie d'images */}
        <div className="space-y-4">
          {/* Image principale */}
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
            <Image
              src={displayImages[currentImageIndex] || '/placeholder.svg'}
              alt={`${normalizedProduct.name} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-all duration-300"
              priority={currentImageIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
            />

            {/* Bouton favoris en overlay */}
            {isAuthenticated && isAvailable && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={toggleFavorite}
                  disabled={isLoadingFavorites}
                  className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm ${
                    isLoadingFavorites
                      ? 'opacity-50 cursor-not-allowed bg-white/60'
                      : isFavorite
                        ? 'bg-[#0a3d3f] hover:bg-[#0a4d4f] shadow-lg'
                        : 'bg-white/80 hover:bg-white shadow-lg'
                  }`}
                  title={
                    isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
                  }
                >
                  <Heart
                    size={20}
                    className={
                      isFavorite ? 'fill-white text-white' : 'text-gray-600'
                    }
                  />
                </button>
              </div>
            )}

            {/* Navigation pour plusieurs images */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Indicateur de position */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>

          {/* Miniatures */}
          {displayImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'border-[#0a3d3f] ring-2 ring-[#0a3d3f]/30 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={`${normalizedProduct.name} - Miniature ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="space-y-6 lg:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#010101] mb-4 leading-tight">
              {normalizedProduct.name}
            </h1>
          </div>

          <div className="space-y-4">
            <div className="flex items-center border-b border-gray-200 pb-3">
              <span className="w-24 font-medium text-[#010101]">Type :</span>
              <span className="text-gray-600">
                {getBoardTypeText(normalizedProduct.type)}
              </span>
            </div>
            {normalizedProduct.description && (
              <div className="border-b border-gray-200 pb-3">
                <span className="font-medium text-[#010101] block mb-2">
                  Description :
                </span>
                <p className="text-gray-600 leading-relaxed">
                  {normalizedProduct.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-[#0a3d3f]">
              <span className="text-2xl sm:text-3xl font-normal">
                {normalizedProduct.priceEuro.toFixed(2)} €
              </span>
            </div>
            {normalizedProduct.pricePoints &&
              normalizedProduct.pricePoints > 0 && (
                <span className="text-sm text-gray-600 bg-[#f8f7f4] px-3 py-1 rounded-full">
                  ou {normalizedProduct.pricePoints} points
                </span>
              )}
          </div>

          <button
            onClick={handleToggleCart}
            disabled={isPending || !isAvailable}
            className={`w-full px-6 py-4 text-base sm:text-lg font-normal rounded-full transition-colors flex items-center justify-center ${
              !isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0a3d3f] text-white hover:bg-[#0a4d4f]'
            }`}
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

          {!isAuthenticated && (
            <p className="text-sm text-gray-500 text-center">
              <a
                href="/authentification/connexion"
                className="text-[#0a3d3f] hover:underline"
              >
                Connectez-vous
              </a>{' '}
              pour ajouter aux favoris
            </p>
          )}

          <div className="bg-[#f8f7f4] rounded-xl p-6">
            <p className="text-gray-600">
              <span className="font-medium text-[#010101]">
                Livraison gratuite
              </span>{' '}
              à partir de 100€ d&apos;achat
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-medium text-[#010101]">Retour gratuit</span>{' '}
              sous 14 jours
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
